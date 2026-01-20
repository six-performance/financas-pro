import { Asset, InvestmentType } from '@/types';
import { getBrapiAssets, getBrapiQuote } from './brapiService';
import { getBinanceAssets } from './binanceService';
import { getTesouroDiretoAssets, getTesouroDiretoQuote } from './tesouroDiretoService';

export interface PaginatedAssets {
  assets: Asset[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
}

/**
 * Busca todos os ativos de todos os tipos (unificado via Brapi)
 */
export const getAllAssets = async (page: number = 1): Promise<PaginatedAssets> => {
  try {
    const itemsPerPage = 50;
    
    const [acoesData, cripto, rendaFixa] = await Promise.all([
      getBrapiAssets('all', page, itemsPerPage),
      getBinanceAssets().catch(() => []), // Binance API - gratuita
      getTesouroDiretoAssets().catch(() => []), // Dados estáticos
    ]);

    const allAssets = [...acoesData.assets, ...cripto, ...rendaFixa];

    return {
      assets: allAssets,
      totalPages: acoesData.totalPages,
      totalCount: acoesData.totalCount + cripto.length + rendaFixa.length,
      currentPage: page,
    };
  } catch (error) {
    console.error('Erro ao buscar todos os ativos:', error);
    return { assets: [], totalPages: 1, totalCount: 0, currentPage: 1 };
  }
};

/**
 * Busca ativos por tipo (unificado via Brapi)
 */
export const getAssetsByType = async (
  type: InvestmentType,
  page: number = 1
): Promise<PaginatedAssets> => {
  try {
    switch (type) {
      case 'acao': {
        const data = await getBrapiAssets('stock', page, 50);
        return {
          assets: data.assets,
          totalPages: data.totalPages,
          totalCount: data.totalCount,
          currentPage: page,
        };
      }
      case 'fundo': {
        const data = await getBrapiAssets('fii', page, 50);
        return {
          assets: data.assets,
          totalPages: data.totalPages,
          totalCount: data.totalCount,
          currentPage: page,
        };
      }
      case 'rendaFixa': {
        try {
          const rendaFixa = await getTesouroDiretoAssets();
          return {
            assets: rendaFixa,
            totalPages: 1,
            totalCount: rendaFixa.length,
            currentPage: 1,
          };
        } catch (error) {
          console.error('Falha ao carregar Tesouro Direto:', error);
          return {
            assets: [],
            totalPages: 1,
            totalCount: 0,
            currentPage: 1,
          };
        }
      }
      case 'cripto': {
        try {
          const cripto = await getBinanceAssets();
          return {
            assets: cripto,
            totalPages: 1,
            totalCount: cripto.length,
            currentPage: 1,
          };
        } catch (error) {
          console.error('Falha ao carregar criptomoedas:', error);
          return {
            assets: [],
            totalPages: 1,
            totalCount: 0,
            currentPage: 1,
          };
        }
      }
      default:
        return { assets: [], totalPages: 1, totalCount: 0, currentPage: 1 };
    }
  } catch (error) {
    console.error(`Erro ao buscar ativos do tipo ${type}:`, error);
    return { assets: [], totalPages: 1, totalCount: 0, currentPage: 1 };
  }
};

/**
 * Busca cotação de um ativo específico (unificado via Brapi)
 */
export const getAssetQuote = async (ticker: string, type: InvestmentType): Promise<Asset | null> => {
  try {
    // Para renda fixa, buscar do Tesouro Direto
    if (type === 'rendaFixa') {
      return await getTesouroDiretoQuote(ticker);
    }
    
    // Para todos os outros, usar Brapi
    return await getBrapiQuote(ticker, type);
  } catch (error) {
    console.error(`Erro ao buscar cotação de ${ticker}:`, error);
    return null;
  }
};

