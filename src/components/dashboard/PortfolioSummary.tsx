'use client';

import { Investment, PortfolioSummary as PortfolioSummaryType } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Target,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const COLORS = ['#ff6b2d', '#10b981', '#f59e0b', '#b91c1c'];

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
  investments: Investment[];
}

export function PortfolioSummaryComponent({ summary, investments }: PortfolioSummaryProps) {
  const getDistributionData = () => {
    const distribution: Record<string, number> = {
      acao: 0,
      fundo: 0,
      rendaFixa: 0,
      cripto: 0,
    };

    investments.forEach((inv) => {
      distribution[inv.type] += inv.valorTotal;
    });

    return Object.entries(distribution)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: key === 'acao' ? 'Ações' : key === 'fundo' ? 'Fundos' : key === 'rendaFixa' ? 'Renda Fixa' : 'Cripto',
        value,
      }));
  };

  return (
    <>
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Valor Total */}
        <Card className="!bg-gradient-to-br !from-[#ff6b2d] !to-[#b91c1c] text-white border-0 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Valor Total</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.valorTotal)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Investido */}
        <Card className="!bg-gradient-to-br !from-[#b91c1c] !to-red-800 text-white border-0 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Investido</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalInvestido)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lucro/Prejuízo */}
        <Card 
          className={cn(
            "text-white border-0 hover:shadow-lg transition-shadow",
            summary.lucroOuPrejuizo >= 0
              ? "!bg-gradient-to-br !from-[#10b981] !to-green-700"
              : "!bg-gradient-to-br !from-orange-400 !to-red-600"
          )}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Lucro/Prejuízo</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.lucroOuPrejuizo)}</p>
                <p className="text-sm mt-1 font-semibold">
                  {summary.percentualRetorno >= 0 ? '+' : ''}{summary.percentualRetorno.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                {summary.lucroOuPrejuizo >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Número de Investimentos */}
        <Card className="!bg-gradient-to-br !from-[#f59e0b] !to-orange-500 text-white border-0 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm opacity-90 mb-1">Investimentos</p>
                <p className="text-3xl font-bold">{summary.numeroInvestimentos}</p>
                <p className="text-sm mt-1">
                  {summary.numeroInvestimentos === 1 ? 'ativo' : 'ativos'}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Lista */}
      {investments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuição do Portfólio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Distribuição do Portfólio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${((entry.value / summary.totalInvestido) * 100).toFixed(1)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Investimentos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Investimentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {investments.slice(0, 5).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{inv.ticker}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{inv.nome}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--foreground)]">
                        {formatCurrency(inv.valorTotal)}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {inv.quantidade} {inv.quantidade === 1 ? 'unidade' : 'unidades'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4 border-2 border-brand-orange">
              <Target className="w-10 h-10 text-brand-orange" />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
              Você ainda não tem investimentos
            </h3>
            <p className="text-[var(--muted-foreground)] text-center max-w-md">
              Comece sua jornada de investimentos explorando nossos ativos disponíveis
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

