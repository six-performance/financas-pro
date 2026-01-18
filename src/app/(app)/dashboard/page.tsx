'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Investment, PortfolioSummary } from '@/types';
import { AssetWithDividends, DividendData } from '@/types/dividends';
import { PageHeader } from '@/components/ui/page-header';
import { PortfolioSummaryComponent } from '@/components/dashboard/PortfolioSummary';
import { DividendsSection } from '@/components/dashboard/DividendsSection';
import { DashboardCardGridSkeleton, DashboardChartSkeleton } from '@/components/ui/dashboard-card-skeleton';

const supabaseClient = createClient();

export default function DashboardPage() {
  const { user } = useAuth();
  
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    valorTotal: 0,
    totalInvestido: 0,
    lucroOuPrejuizo: 0,
    percentualRetorno: 0,
    numeroInvestimentos: 0,
  });
  const [loadingData, setLoadingData] = useState(true);
  
  const [assets, setAssets] = useState<AssetWithDividends[]>([]);
  const [loadingDividends, setLoadingDividends] = useState(true);
  const [errorDividends, setErrorDividends] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingData(false);
      setLoadingDividends(false);
      return;
    }

    loadInvestments();
    loadDividends();
  }, [user?.uid]);

  const loadInvestments = async () => {
    if (!user?.uid) return;

    try {
      setLoadingData(true);
      
      const { data: investmentsData, error } = await supabaseClient
        .from('investments')
        .select('*')
        .eq('user_id', user.uid);

      if (error) {
        console.error('Erro ao buscar investimentos:', error);
        setInvestments([]);
        setSummary({
          valorTotal: 0,
          totalInvestido: 0,
          lucroOuPrejuizo: 0,
          percentualRetorno: 0,
          numeroInvestimentos: 0,
        });
        setLoadingData(false);
        return;
      }

      const investmentsList: Investment[] = [];
      let totalInvestido = 0;
      let valorTotal = 0;

      for (const data of investmentsData || []) {
        const investment: Investment = {
          id: data.id,
          userId: data.user_id,
          type: data.type,
          ticker: data.ticker,
          nome: data.nome,
          quantidade: data.quantidade,
          precoMedio: data.preco_medio,
          dataCompra: new Date(data.data_compra),
          valorTotal: data.valor_total,
        };

        investmentsList.push(investment);
        totalInvestido += investment.valorTotal;

        try {
          const response = await fetch(`/api/quotes/${investment.ticker}`);
          if (response.ok) {
            const quoteData = await response.json();
            valorTotal += quoteData.price * investment.quantidade;
          } else {
            valorTotal += investment.valorTotal;
          }
        } catch (quoteError) {
          console.error(`Erro ao buscar cotação de ${investment.ticker}:`, quoteError);
          valorTotal += investment.valorTotal;
        }
      }

      const lucroOuPrejuizo = valorTotal - totalInvestido;
      const percentualRetorno = totalInvestido > 0 ? (lucroOuPrejuizo / totalInvestido) * 100 : 0;

      setSummary({
        valorTotal,
        totalInvestido,
        lucroOuPrejuizo,
        percentualRetorno,
        numeroInvestimentos: investmentsList.length,
      });

      setInvestments(investmentsList);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      setInvestments([]);
      setSummary({
        valorTotal: 0,
        totalInvestido: 0,
        lucroOuPrejuizo: 0,
        percentualRetorno: 0,
        numeroInvestimentos: 0,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadDividends = async () => {
    if (!user?.uid) return;

    try {
      setLoadingDividends(true);
      setErrorDividends(null);

      const { data: investmentsData, error: investError } = await supabaseClient
        .from('investments')
        .select('*')
        .eq('user_id', user.uid)
        .eq('type', 'acao');

      if (investError) {
        console.error('Erro ao buscar investimentos:', investError);
        setErrorDividends('Erro ao carregar investimentos');
        return;
      }

      if (!investmentsData || investmentsData.length === 0) {
        setAssets([]);
        setLoadingDividends(false);
        return;
      }

      const assetsWithDividends = await Promise.all(
        investmentsData.map(async (inv: any) => {
          try {
            const response = await fetch(`/api/dividends/${inv.ticker}`);
            const data = await response.json();

            const dataCompra = new Date(inv.data_compra);
            const umAnoAtras = new Date();
            umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);

            const dividendsLast12Months = (data.dividends || [])
              .filter((d: DividendData) => d.type === 'cash')
              .filter((d: DividendData) => {
                const divDate = new Date(d.date);
                return divDate >= umAnoAtras && divDate <= new Date();
              });

            const totalRecebido = dividendsLast12Months
              .filter((d: DividendData) => new Date(d.date) >= dataCompra)
              .reduce((sum: number, d: DividendData) => sum + (d.value * inv.quantidade), 0);

            return {
              ticker: inv.ticker,
              quantidade: inv.quantidade,
              dataCompra: dataCompra,
              valorInvestido: inv.valor_total,
              dividends: dividendsLast12Months,
              totalRecebido: totalRecebido,
              dividendYield: data.summary?.dividendYield || 0,
            };
          } catch (err) {
            console.error(`Erro ao buscar dividendos de ${inv.ticker}:`, err);
            return {
              ticker: inv.ticker,
              quantidade: inv.quantidade,
              dataCompra: new Date(inv.data_compra),
              valorInvestido: inv.valor_total,
              dividends: [],
              totalRecebido: 0,
              dividendYield: 0,
            };
          }
        })
      );

      setAssets(assetsWithDividends);
    } catch (err) {
      console.error('Erro ao carregar dividendos:', err);
      setErrorDividends('Erro ao carregar dados de dividendos');
    } finally {
      setLoadingDividends(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title={`Bem-vindo, ${user?.displayName}!`}
        description="Aqui está um resumo dos seus investimentos"
        icon="👋"
      />

      {loadingData ? (
        <>
          <DashboardCardGridSkeleton />
          <DashboardChartSkeleton />
        </>
      ) : (
        <>
          {/* Componente de Resumo da Carteira */}
          <PortfolioSummaryComponent 
            summary={summary} 
            investments={investments} 
          />

          {/* Componente de Dividendos */}
          <DividendsSection
            assets={assets}
            loading={loadingDividends}
            error={errorDividends}
          />
        </>
      )}
    </div>
  );
}
