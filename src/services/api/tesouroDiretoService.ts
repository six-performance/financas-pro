import { Asset } from '@/types';

/**
 * Dados estáticos de títulos do Tesouro Direto
 * Nota: Dados de referência baseados em valores de mercado típicos
 * Para dados em tempo real, considere usar a API da Fintz (https://docs.fintz.com.br/)
 */
export const getTesouroDiretoAssets = async (): Promise<Asset[]> => {
  // Simular pequeno delay para parecer requisição real
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const assets: Asset[] = [
    {
      ticker: 'TESOURO_SELIC_2027',
      nome: 'Tesouro Selic 2027',
      preco: 15456.78,
      variacao: 13.65, // Taxa anual %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_SELIC_2029',
      nome: 'Tesouro Selic 2029',
      preco: 15234.56,
      variacao: 13.75, // Taxa anual %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_PREFIXADO_2027',
      nome: 'Tesouro Prefixado 2027',
      preco: 786.45,
      variacao: 12.45, // Taxa anual %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_PREFIXADO_2029',
      nome: 'Tesouro Prefixado 2029',
      preco: 654.32,
      variacao: 12.85, // Taxa anual %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_IPCA+_2029',
      nome: 'Tesouro IPCA+ 2029',
      preco: 3245.78,
      variacao: 6.25, // IPCA + taxa %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_IPCA+_2035',
      nome: 'Tesouro IPCA+ 2035',
      preco: 2567.89,
      variacao: 6.45, // IPCA + taxa %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_IPCA+_2045',
      nome: 'Tesouro IPCA+ 2045',
      preco: 1876.54,
      variacao: 6.55, // IPCA + taxa %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_IPCA+_JUROS_2032',
      nome: 'Tesouro IPCA+ com Juros Semestrais 2032',
      preco: 3876.45,
      variacao: 6.35, // IPCA + taxa %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_RENDA+_2040',
      nome: 'Tesouro Renda+ Aposentadoria Extra 2040',
      preco: 1987.65,
      variacao: 6.48, // IPCA + taxa %
      tipo: 'rendaFixa',
    },
    {
      ticker: 'TESOURO_EDUCA+_2041',
      nome: 'Tesouro Educa+ 2041',
      preco: 2134.56,
      variacao: 6.42, // IPCA + taxa %
      tipo: 'rendaFixa',
    },
  ];

  return assets;
};

/**
 * Busca um título específico do Tesouro Direto
 */
export const getTesouroDiretoQuote = async (ticker: string): Promise<Asset | null> => {
  const assets = await getTesouroDiretoAssets();
  return assets.find(asset => asset.ticker === ticker) || null;
};
