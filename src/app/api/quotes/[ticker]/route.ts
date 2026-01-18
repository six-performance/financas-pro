import { NextRequest, NextResponse } from 'next/server';

const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_API_KEY = process.env.BRAPI_API_KEY || process.env.NEXT_PUBLIC_BRAPI_API_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  
  try {
    // Buscar cotação diretamente da BrAPI
    const brapiUrl = BRAPI_API_KEY 
      ? `${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_API_KEY}`
      : `${BRAPI_BASE_URL}/quote/${ticker}`;
    
    const response = await fetch(brapiUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Cotação não encontrada' },
        { status: 404 }
      );
    }

    const data = await response.json();
    const result = data.results?.[0];
    
    if (!result) {
      return NextResponse.json(
        { error: 'Cotação não encontrada' },
        { status: 404 }
      );
    }

    const quoteData = {
      ticker: ticker,
      price: result.regularMarketPrice || result.close || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      volume: result.regularMarketVolume || 0,
      lastUpdate: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    return NextResponse.json(quoteData);

  } catch (error) {
    console.error(`Erro ao buscar cotação de ${ticker}:`, error);
    return NextResponse.json(
      { error: 'Erro ao buscar cotação' },
      { status: 500 }
    );
  }
}

