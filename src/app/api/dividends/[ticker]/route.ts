import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

interface BrapiDividend {
  paymentDate: string | null;
  rate: number;
  type?: string;
  label?: string;
  relatedTo?: string;
}

interface Dividend {
  date: string;
  value: number;
  type?: string;
}

interface BrapiQuoteResult {
  results?: Array<{
    symbol: string;
    regularMarketPrice: number;
    dividendsData?: {
      cashDividends?: BrapiDividend[];
      stockDividends?: BrapiDividend[];
    };
  }>;
}

// Cliente axios configurado para ignorar erros de SSL
const axiosClient = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  
  try {
    const apiKey = process.env.BRAPI_API_KEY || '';
    const url = apiKey
      ? `https://brapi.dev/api/quote/${ticker}?dividends=true&token=${apiKey}`
      : `https://brapi.dev/api/quote/${ticker}?dividends=true`;

    const response = await axiosClient.get<BrapiQuoteResult>(url);
    const data = response.data;
    
    if (!data.results || data.results.length === 0) {
      throw new Error('Dados não encontrados');
    }

    const quote = data.results[0];
    const precoAtual = quote.regularMarketPrice || 0;
    
    // Combinar dividendos em dinheiro e em ações
    const cashDividends = quote.dividendsData?.cashDividends || [];
    const stockDividends = quote.dividendsData?.stockDividends || [];
    
    // Mapear para formato padronizado e filtrar apenas os que têm data de pagamento
    const allDividends: Dividend[] = [
      ...cashDividends
        .filter((d: BrapiDividend) => d.paymentDate !== null)
        .map((d: BrapiDividend) => ({
          date: d.paymentDate as string,
          value: d.rate,
          type: 'cash'
        })),
      ...stockDividends
        .filter((d: BrapiDividend) => d.paymentDate !== null)
        .map((d: BrapiDividend) => ({
          date: d.paymentDate as string,
          value: d.rate,
          type: 'stock'
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calcular estatísticas dos últimos 12 meses
    const umAnoAtras = new Date();
    umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1);
    const hoje = new Date();
    
    const dividendsLast12Months = allDividends.filter(
      d => {
        const divDate = new Date(d.date);
        return d.type === 'cash' && divDate >= umAnoAtras && divDate <= hoje;
      }
    );
    
    const totalLast12Months = dividendsLast12Months.reduce((sum, d) => sum + d.value, 0);
    const dividendYield = precoAtual > 0 ? (totalLast12Months / precoAtual) * 100 : 0;
    
    // Último dividendo pago (apenas os que já foram pagos)
    const lastDividend = allDividends.find(d => d.type === 'cash' && new Date(d.date) <= hoje);
    
    // Média mensal
    const monthlyAverage = dividendsLast12Months.length > 0 
      ? totalLast12Months / 12 
      : 0;

    return NextResponse.json({
      ticker,
      currentPrice: precoAtual,
      dividends: allDividends,
      summary: {
        last12Months: totalLast12Months,
        dividendYield: dividendYield,
        totalDividends: allDividends.length,
        cashDividends: cashDividends.length,
        stockDividends: stockDividends.length,
        lastDividend: lastDividend || null,
        monthlyAverage: monthlyAverage,
      }
    });
    
  } catch (error) {
    console.error(`Erro ao buscar dividendos de ${ticker}:`, error);
    return NextResponse.json({
      ticker,
      currentPrice: 0,
      dividends: [],
      summary: {
        last12Months: 0,
        dividendYield: 0,
        totalDividends: 0,
        cashDividends: 0,
        stockDividends: 0,
        lastDividend: null,
        monthlyAverage: 0,
      }
    }, { status: 200 }); // Status 200 para não quebrar a UI
  }
}

