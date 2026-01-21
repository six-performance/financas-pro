'use client';

import MarketNews from '@/components/MarketNews';
import { PageHeader } from '@/components/ui/page-header';

export default function NoticiasPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Notícias do Mercado"
        description="Fique por dentro das principais notícias e acontecimentos do mercado financeiro"
        icon="📰"
      />

      {/* Componente de Notícias */}
      <MarketNews />
    </div>
  );
}

