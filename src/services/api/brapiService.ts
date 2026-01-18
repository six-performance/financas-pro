import { Asset, InvestmentType } from '@/types';

const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_API_KEY = process.env.BRAPI_API_KEY || process.env.NEXT_PUBLIC_BRAPI_API_KEY || '';

export interface BrapiQuote {
  stock: string;
  name: string;
  close: number;
  change: number;
  logo: string;
}

export interface BrapiPaginatedResponse {
  stocks: BrapiQuote[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalCount: number;
  hasNextPage: boolean;
}

export interface BrapiCrypto {
  currency: string;
  currencyRateFromUSD: number;
  coinName: string;
  coin: string;
  regularMarketChange: number;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketDayLow: number;
  regularMarketDayHigh: number;
  regularMarketDayRange: string;
  regularMarketVolume: number;
  marketCap: number;
  regularMarketTime: string;
  coinImageUrl: string;
}

export const getBrapiAssets = async (
  type: 'stock' | 'fii' | 'all' = 'all',
  page: number = 1,
  limit: number = 50
): Promise<{ assets: Asset[]; totalPages: number; totalCount: number }> => {
  try {
    // Se estiver buscando FIIs, precisamos buscar mais resultados porque eles são filtrados
    // Na prática, FIIs são cerca de 20-30% dos ativos
    const effectiveLimit = type === 'fii' ? limit * 3 : limit;
    
    const url = BRAPI_API_KEY 
      ? `${BRAPI_BASE_URL}/quote/list?page=${page}&limit=${effectiveLimit}&sortBy=volume&sortOrder=desc&token=${BRAPI_API_KEY}`
      : `${BRAPI_BASE_URL}/quote/list?page=${page}&limit=${effectiveLimit}&sortBy=volume&sortOrder=desc`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar ativos da brapi');
    }

    const data: BrapiPaginatedResponse = await response.json();
    const stocks: BrapiQuote[] = data.stocks || [];

    let filtered = stocks;
    
    if (type === 'stock') {
      filtered = stocks.filter(s => !s.stock.includes('11')); // Filtro simples para ações
    } else if (type === 'fii') {
      filtered = stocks.filter(s => s.stock.includes('11')); // FIIs geralmente terminam com 11
      // Limitar ao número original solicitado após filtrar
      filtered = filtered.slice(0, limit);
    }

    const assets = filtered.map(stock => ({
      ticker: stock.stock,
      nome: stock.name,
      preco: stock.close,
      variacao: stock.change,
      tipo: stock.stock.includes('11') ? 'fundo' as const : 'acao' as const,
      logo: stock.logo,
    }));

    return {
      assets,
      totalPages: data.totalPages || 1,
      totalCount: data.totalCount || assets.length,
    };
  } catch (error) {
    console.error('Erro ao buscar ativos da brapi:', error);
    return { assets: [], totalPages: 1, totalCount: 0 };
  }
};

export const getBrapiQuote = async (ticker: string, tipo?: InvestmentType): Promise<Asset | null> => {
  try {
    const url = BRAPI_API_KEY 
      ? `${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_API_KEY}`
      : `${BRAPI_BASE_URL}/quote/${ticker}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar cotação de ${ticker}`);
    }

    const data = await response.json();
    const result = data.results?.[0];

    if (!result) return null;

    // Determinar o tipo baseado no ticker ou usar o tipo fornecido
    let assetType: InvestmentType = tipo || 'acao';
    if (!tipo) {
      if (result.symbol.includes('11')) assetType = 'fundo';
      else if (result.symbol.endsWith('USD') || result.symbol.includes('BTC') || result.symbol.includes('ETH')) assetType = 'cripto';
    }

    return {
      ticker: result.symbol,
      nome: result.shortName || result.longName,
      preco: result.regularMarketPrice,
      variacao: result.regularMarketChangePercent,
      tipo: assetType,
      logo: result.logourl,
    };
  } catch (error) {
    console.error(`Erro ao buscar cotação de ${ticker}:`, error);
    return null;
  }
};

/**
 * Redireciona para o serviço da Binance (dados em tempo real)
 * A Binance oferece API pública gratuita sem necessidade de chave
 */
export const getBrapiCrypto = async (): Promise<Asset[]> => {
  // Importar dinamicamente para evitar problemas de circular dependency
  const { getBinanceAssets } = await import('./binanceService');
  return getBinanceAssets();
};



