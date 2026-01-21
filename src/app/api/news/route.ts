import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

export async function GET(request: Request) {
  try {
    // Parâmetros de paginação da URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Feeds específicos de mercado financeiro e investimentos
    const feeds = [
      { url: 'https://www.infomoney.com.br/mercados/feed/', source: 'InfoMoney' },
      { url: 'https://www.infomoney.com.br/onde-investir/feed/', source: 'InfoMoney' },
      { url: 'https://valor.globo.com/financas/rss', source: 'Valor Econômico' },
    ];
    
    // Palavras-chave relevantes para filtrar notícias de investimentos
    const palavrasChaveRelevantes = [
      'bolsa', 'ações', 'ibovespa', 'investimento', 'fundos', 'fii', 'dividendo',
      'mercado', 'cotação', 'dólar', 'juros', 'selic', 'cdb', 'tesouro',
      'vale', 'petrobras', 'itaú', 'banco', 'bradesco', 'ambev', 'magazine luiza',
      'b3', 'bovespa', 'ipo', 'oferta', 'ação', 'título', 'renda fixa',
      'carteira', 'portfólio', 'analista', 'recomendação', 'balanço', 'lucro',
      'resultado', 'receita', 'copom', 'bacen', 'cvm', 'economia'
    ];
    
    // Palavras-chave irrelevantes (para excluir)
    const palavrasChaveExcluir = [
      'futebol', 'esporte', 'novela', 'celebridade', 'entretenimento',
      'crime', 'acidente', 'tempo', 'previsão', 'horóscopo'
    ];
    
    const allNews: NewsItem[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    // Buscar de cada feed (pegando mais itens)
    for (const feed of feeds) {
      try {
        const feedData = await parser.parseURL(feed.url);
        
        feedData.items?.forEach(item => {
          const title = (item.title || '').toLowerCase();
          const content = (item.contentSnippet || item.content || '').toLowerCase();
          const fullText = `${title} ${content}`;
          const newsDate = new Date(item.pubDate || new Date());
          newsDate.setHours(0, 0, 0, 0);
          
          // Filtrar apenas notícias de hoje
          if (newsDate.getTime() !== hoje.getTime()) {
            return;
          }
          
          // Verificar se contém palavras irrelevantes (excluir)
          const temPalavraIrrelevante = palavrasChaveExcluir.some(palavra => 
            fullText.includes(palavra)
          );
          
          if (temPalavraIrrelevante) {
            return; // Pular esta notícia
          }
          
          // Verificar se contém palavras relevantes
          const temPalavraRelevante = palavrasChaveRelevantes.some(palavra => 
            fullText.includes(palavra)
          );
          
          // Só adicionar se for relevante
          if (temPalavraRelevante) {
            allNews.push({
              title: item.title || '',
              link: item.link || '',
              pubDate: item.pubDate || new Date().toISOString(),
              source: feed.source
            });
          }
        });
      } catch (err) {
        console.error(`Erro ao buscar ${feed.source}:`, err);
      }
    }
    
    // Ordenar por data (mais recentes primeiro)
    allNews.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
    
    // Remover duplicatas pelo título
    const uniqueNews = allNews.filter((news, index, self) =>
      index === self.findIndex((n) => n.title === news.title)
    );
    
    // Calcular paginação
    const totalItems = uniqueNews.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNews = uniqueNews.slice(startIndex, endIndex);
    
    return NextResponse.json({
      news: paginatedNews,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      lastUpdate: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    return NextResponse.json({
      news: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      },
      lastUpdate: new Date().toISOString(),
      error: 'Erro ao carregar notícias'
    });
  }
}

