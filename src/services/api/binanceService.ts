import { Asset } from '@/types';

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
}

const POPULAR_CRYPTOS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT',
  'XRPUSDT', 'DOTUSDT', 'UNIUSDT', 'LTCUSDT', 'LINKUSDT',
  'MATICUSDT', 'SOLUSDT', 'AVAXUSDT', 'ATOMUSDT'
];

export const getBinanceAssets = async (): Promise<Asset[]> => {
  try {
    const response = await fetch(`${BINANCE_BASE_URL}/ticker/24hr`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar criptomoedas da Binance');
    }

    const data: BinanceTicker[] = await response.json();
    
    // Cotação do dólar para converter para BRL (aproximado)
    const USD_TO_BRL = 5.15; // Atualizar conforme necessário
    
    // Nomes completos das criptomoedas
    const cryptoNames: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'Binance Coin',
      'ADA': 'Cardano',
      'DOGE': 'Dogecoin',
      'XRP': 'Ripple',
      'DOT': 'Polkadot',
      'UNI': 'Uniswap',
      'LTC': 'Litecoin',
      'LINK': 'Chainlink',
      'MATIC': 'Polygon',
      'SOL': 'Solana',
      'AVAX': 'Avalanche',
      'ATOM': 'Cosmos',
    };
    
    // Filtrar apenas criptos populares em USDT
    const filtered = data
      .filter(ticker => POPULAR_CRYPTOS.includes(ticker.symbol))
      .map(ticker => {
        const symbol = ticker.symbol.replace('USDT', '');
        return {
          ticker: symbol,
          nome: cryptoNames[symbol] || symbol,
          preco: parseFloat(ticker.lastPrice) * USD_TO_BRL, // Converter para BRL
          variacao: parseFloat(ticker.priceChangePercent),
          tipo: 'cripto' as const,
          logo: `https://assets.coingecko.com/coins/images/${getCoinGeckoId(symbol)}/large/${symbol.toLowerCase()}.png`,
        };
      });

    return filtered;
  } catch (error) {
    console.error('Erro ao buscar criptomoedas da Binance:', error);
    throw error;
  }
};

// Helper para mapear IDs do CoinGecko para logos
function getCoinGeckoId(symbol: string): number {
  const ids: Record<string, number> = {
    'BTC': 1,
    'ETH': 279,
    'BNB': 825,
    'ADA': 975,
    'DOGE': 5,
    'XRP': 44,
    'DOT': 12171,
    'UNI': 7083,
    'LTC': 2,
    'LINK': 1975,
    'MATIC': 4713,
    'SOL': 4128,
    'AVAX': 12559,
    'ATOM': 3794,
  };
  return ids[symbol] || 1;
}


