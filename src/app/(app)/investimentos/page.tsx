'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Asset, InvestmentType, RiskProfile } from '@/types';
import { getAllAssets, getAssetsByType, PaginatedAssets } from '@/services/api/investmentService';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, TrendingDown, Plus, Loader2, CheckCircle2, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getInvestmentTypeName,
  getInvestmentTypeEmoji,
  getEffectiveProfile,
  profileInfo,
} from '@/lib/investmentHelpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SmartPagination } from '@/components/ui/pagination';
import { PageHeader } from '@/components/ui/page-header';
import { AssetGridSkeleton } from '@/components/ui/asset-card-skeleton';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

// Criar instância única do cliente Supabase
const supabaseClient = createClient();

export default function InvestmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<InvestmentType>('rendaFixa');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [investing, setInvesting] = useState(false);
  const [page, setPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    setPage(1); // Resetar para página 1 ao mudar de tab
    loadAssets(1);
  }, [currentTab]);

  const loadAssets = async (pageNumber: number = 1) => {
    try {
      setLoadingAssets(true);
      
      // Buscar ativos pelo tipo específico
      const data = await getAssetsByType(currentTab, pageNumber);

      setAssets(data.assets);
      setServerTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setPage(pageNumber);
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleTabChange = (newValue: string) => {
    setCurrentTab(newValue as InvestmentType);
    setPage(1);
  };

  const handleOpenModal = async (asset: Asset) => {
    // Todos os ativos mostrados já são compatíveis, então pode abrir direto
    setSelectedAsset(asset);
    setQuantidade(1);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAsset(null);
    setQuantidade(1);
  };

  const handleInvest = async () => {
    if (!user || !selectedAsset) return;

    try {
      setInvesting(true);
      
      const valorTotal = selectedAsset.preco * quantidade;
      
      const { error } = await supabaseClient
        .from('investments')
        .insert({
          user_id: user.uid,
          type: selectedAsset.tipo,
          ticker: selectedAsset.ticker,
          nome: selectedAsset.nome,
          quantidade,
          preco_medio: selectedAsset.preco,
          data_compra: new Date().toISOString(),
          valor_total: valorTotal,
        });

      if (error) {
        console.error('Erro ao investir:', error);
        alert(`Erro ao realizar investimento: ${error.message}`);
        return;
      }

      toast.success(`Investimento realizado! ${quantidade} ${quantidade > 1 ? 'cotas' : 'cota'} de ${selectedAsset.ticker} adicionadas.`);
      
      handleCloseModal();
    } catch (error: any) {
      console.error('Erro ao investir:', error);
      toast.error('Não foi possível realizar o investimento. Tente novamente.');
    } finally {
      setInvesting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Paginação
  const useServerPagination = currentTab === 'acao';
  
  let paginatedAssets: Asset[];
  let totalPages: number;

  if (useServerPagination) {
    const localPage = ((page - 1) % 5) + 1;
    paginatedAssets = assets.slice(
      (localPage - 1) * itemsPerPage,
      localPage * itemsPerPage
    );
    totalPages = serverTotalPages * 5;
  } else {
    paginatedAssets = assets.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
    totalPages = Math.ceil(assets.length / itemsPerPage);
  }

  const handlePageChange = async (value: number) => {
    if (useServerPagination) {
      const serverPage = Math.ceil(value / 5);
      const currentServerPage = Math.ceil(page / 5);
      
      if (serverPage !== currentServerPage) {
        await loadAssets(serverPage);
        setPage(value);
      } else {
        setPage(value);
      }
    } else {
      setPage(value);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <PageHeader 
        title="Explorar Investimentos"
        description="Descubra as melhores oportunidades de investimento para seu perfil"
        icon="📊"
      />

        {/* Banner de Incentivo - Perfil Não Definido */}
        {!user?.riskProfile && (
          <Card className="border-2 border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Título */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2">
                    🎯 Descubra Seu Perfil de Investidor!
                  </h3>
                  <p className="text-sm sm:text-base text-amber-800 mb-3">
                    Você está navegando com perfil <strong>Conservador (padrão)</strong>. 
                    Complete nosso quiz rápido para desbloquear investimentos personalizados para você!
                  </p>
                </div>
                
                {/* Benefícios */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                    <span>Recomendações IA personalizadas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                    <span>Desbloqueie mais categorias</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-900">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                    <span>Apenas 2 minutos</span>
                  </div>
                </div>
                
                {/* Botão */}
                <div>
                  <Button 
                    size="default"
                    className="w-full sm:w-auto bg-gradient-to-r from-[#ff6b2d] to-[#b91c1c] hover:from-[#ff6b2d]/90 hover:to-[#b91c1c]/90 shadow-md text-sm sm:text-base"
                    onClick={() => router.push('/perfil')}
                  >
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Fazer Quiz Agora (2 min)
                  </Button>
                </div>
                
                {/* Info Box */}
                <Alert className="bg-white/50 border-amber-200">
                  <Info className="h-4 w-4 text-amber-600 shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm text-amber-800">
                    <strong>Por que isso importa?</strong> Seu perfil nos ajuda a filtrar apenas investimentos adequados 
                    ao seu nível de conhecimento e tolerância ao risco, protegendo você de decisões inadequadas.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Filtro por Categoria */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <Label className="text-sm font-semibold">
                    Categorias de Investimento
                  </Label>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 hidden sm:block">
                    Explore diferentes tipos de ativos para sua carteira
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const effectiveProfile = getEffectiveProfile(user?.riskProfile as RiskProfile | null);
                    return (
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        {profileInfo[effectiveProfile]?.emoji} {profileInfo[effectiveProfile]?.title}
                      </Badge>
                    );
                  })()}
                  {!user?.riskProfile && (
                    <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                      Padrão
                    </Badge>
                  )}
                </div>
              </div>

              {/* Tabs por Categoria */}
              <Tabs value={currentTab} onValueChange={handleTabChange}>
                <TabsList className={cn(
                  "grid w-full h-auto",
                  getEffectiveProfile(user?.riskProfile as RiskProfile | null) === 'conservador' ? 'grid-cols-1' :
                  getEffectiveProfile(user?.riskProfile as RiskProfile | null) === 'moderado' ? 'grid-cols-3' :
                  getEffectiveProfile(user?.riskProfile as RiskProfile | null) === 'arrojado' ? 'grid-cols-2 sm:grid-cols-4' :
                  'grid-cols-1'
                )}>
                  
                  <TabsTrigger 
                    value="rendaFixa"
                    className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-[#ff6b2d] data-[state=active]:!to-[#b91c1c] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    🏦 Renda Fixa
                  </TabsTrigger>
                  
                  {/* Fundos - apenas moderado e arrojado */}
                  {getEffectiveProfile(user?.riskProfile as RiskProfile | null) !== 'conservador' && (
                    <TabsTrigger 
                      value="fundo"
                      className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-[#ff6b2d] data-[state=active]:!to-[#b91c1c] data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      📈 Fundos
                    </TabsTrigger>
                  )}
                  
                  {/* Ações - apenas moderado e arrojado */}
                  {getEffectiveProfile(user?.riskProfile as RiskProfile | null) !== 'conservador' && (
                    <TabsTrigger 
                      value="acao"
                      className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-[#ff6b2d] data-[state=active]:!to-[#b91c1c] data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      📊 Ações
                    </TabsTrigger>
                  )}
                  
                  {/* Cripto - apenas arrojado */}
                  {getEffectiveProfile(user?.riskProfile as RiskProfile | null) === 'arrojado' && (
                    <TabsTrigger 
                      value="cripto"
                      className="text-xs sm:text-sm py-2 sm:py-2.5 data-[state=active]:!bg-gradient-to-r data-[state=active]:!from-[#ff6b2d] data-[state=active]:!to-[#b91c1c] data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                      ₿ Cripto
                    </TabsTrigger>
                  )}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Assets Grid */}
        {loadingAssets ? (
          <AssetGridSkeleton count={itemsPerPage} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {paginatedAssets.map((asset) => {
                // Todos os ativos aqui já são compatíveis (filtrados no loadAssets)
                return (
                  <Card 
                    key={`${asset.tipo}-${asset.ticker}`}
                    className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-brand-orange/50 relative"
                  >
                    {/* Badge de Compatibilidade - sempre verde */}
                    <Badge 
                      variant="success"
                      className="absolute top-2 right-2 z-10 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1"
                    >
                      ✓ Recomendado
                    </Badge>

                    <CardContent className="p-3 sm:p-4 md:p-5">
                      {/* Header */}
                      <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-slate-200">
                          {asset.logo ? (
                            <AvatarImage src={asset.logo} alt={asset.ticker} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-brand-orange to-brand-red text-white font-bold text-xs sm:text-sm">
                              {asset.ticker.substring(0, 2)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] truncate">
                            {asset.ticker}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className="mt-1 text-[10px] sm:text-xs"
                          >
                            {getInvestmentTypeEmoji(asset.tipo)} {getInvestmentTypeName(asset.tipo)}
                          </Badge>
                        </div>
                      </div>

                    {/* Nome */}
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mb-3 sm:mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                      {asset.nome}
                    </p>

                    {/* Preço e Variação */}
                    <div className="bg-[var(--secondary)] rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <span className="text-[10px] sm:text-xs text-[var(--muted-foreground)] block mb-0.5 sm:mb-1">
                            Preço Atual
                          </span>
                          <span className="text-base sm:text-lg md:text-xl font-bold text-[var(--foreground)]">
                            {formatCurrency(asset.preco)}
                          </span>
                        </div>
                        {asset.variacao !== undefined && (
                          <Badge
                            variant={asset.variacao >= 0 ? "success" : "destructive"}
                            className="gap-0.5 sm:gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2"
                          >
                            {asset.variacao >= 0 ? (
                              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            ) : (
                              <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            )}
                            {asset.variacao >= 0 ? '+' : ''}{asset.variacao.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Botão Investir */}
                    <Button
                      onClick={() => handleOpenModal(asset)}
                      className="w-full gap-1.5 sm:gap-2 text-sm sm:text-base bg-gradient-to-r from-[#ff6b2d] to-[#b91c1c] text-white hover:from-[#ff7b3d] hover:to-[#c92c2c] shadow-md hover:shadow-lg transition-all"
                      size="default"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Investir
                    </Button>
                  </CardContent>
                </Card>
              );
              })}
            </div>

            {/* Paginação */}
            <SmartPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Modal de Investimento - Design Melhorado */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-[var(--card)] w-[95vw] sm:w-full">
            <DialogHeader className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-orange-200">
                  {selectedAsset?.logo ? (
                    <AvatarImage src={selectedAsset.logo} alt={selectedAsset.ticker} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#ff6b2d] to-[#b91c1c] text-white font-bold text-sm">
                      {selectedAsset?.ticker.substring(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#ff6b2d] to-[#b91c1c] bg-clip-text text-transparent truncate">
                    {selectedAsset?.ticker}
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm md:text-base text-[var(--muted-foreground)] line-clamp-1">
                    {selectedAsset?.nome}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedAsset && (
              <div className="space-y-4 sm:space-y-5 py-3 sm:py-4">
                {/* Preço Atual - Destaque */}
                <Card className="bg-[var(--secondary)] border-2 border-orange-200 shadow-sm">
                  <CardContent className="p-3 sm:p-4 md:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] sm:text-xs font-medium text-orange-600 block mb-1 uppercase tracking-wide">
                          Preço Atual
                        </span>
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)]">
                          {formatCurrency(selectedAsset.preco)}
                        </span>
                      </div>
                      {selectedAsset.variacao !== undefined && (
                        <Badge
                          variant={selectedAsset.variacao >= 0 ? "success" : "destructive"}
                          className="gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm"
                        >
                          {selectedAsset.variacao >= 0 ? (
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          ) : (
                            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                          )}
                          {selectedAsset.variacao >= 0 ? '+' : ''}{selectedAsset.variacao.toFixed(2)}%
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quantidade */}
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="quantidade" className="text-xs sm:text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    Quantidade
                  </Label>
                  <div className="relative">
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-lg sm:text-xl font-semibold h-12 sm:h-14 pl-3 sm:pl-4 pr-10 sm:pr-12 border-2 border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-[var(--background)]"
                      placeholder="1"
                    />
                    <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-orange-500 text-xs sm:text-sm font-medium">
                      {quantidade > 1 ? 'cotas' : 'cota'}
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)]">
                    Preço unitário: {formatCurrency(selectedAsset.preco)}
                  </p>
                </div>

                {/* Resumo do Investimento */}
                <Card className="bg-gradient-to-br from-[#ff6b2d] to-[#b91c1c] border-0 text-white shadow-lg">
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                      <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Total a Investir
                      </span>
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2">
                        {quantidade} {quantidade > 1 ? 'cotas' : 'cota'}
                      </Badge>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold block">
                      {formatCurrency(selectedAsset.preco * quantidade)}
                    </span>
                    <p className="text-[10px] sm:text-xs opacity-90 mt-1.5 sm:mt-2">
                      Este valor será debitado da sua conta
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={investing}
                className="w-full sm:flex-1 h-10 sm:h-12 text-sm sm:text-base border-2 border-[var(--border)] hover:bg-[var(--secondary)] hover:border-[var(--border)]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInvest}
                disabled={investing}
                className="w-full sm:flex-1 gap-1.5 sm:gap-2 h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-[#ff6b2d] to-[#b91c1c] hover:from-[#ff6b2d]/90 hover:to-[#b91c1c]/90 text-white font-semibold shadow-lg"
              >
                {investing ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Confirmar</span>
                    <span className="sm:hidden">Confirmar</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}
