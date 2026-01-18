export interface DividendData {
  date: string;
  value: number;
  type?: string;
}

export interface AssetWithDividends {
  ticker: string;
  quantidade: number;
  dataCompra: Date;
  valorInvestido: number;
  dividends: DividendData[];
  totalRecebido: number;
  dividendYield: number;
}

export interface DividendHistoryItem {
  ticker: string;
  date: string;
  valorPorCota: number;
  quantidade: number;
  totalRecebido: number;
  dataCompra?: Date;
}

