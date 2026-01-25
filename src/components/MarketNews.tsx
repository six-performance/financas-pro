'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Newspaper } from 'lucide-react';
import { SmartPagination } from '@/components/ui/pagination';
import { NewsGridSkeleton } from './ui/news-card-skeleton';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });

  useEffect(() => {
    loadNews(1);
  }, []);

  const loadNews = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news?page=${page}&limit=10`);
      const data = await response.json();
      setNews(data.news || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    loadNews(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
        {loading ? (
          <NewsGridSkeleton count={pagination.itemsPerPage} />
        ) : news.length > 0 ? (
          <div className="space-y-6">
            {/* Lista de notícias */}
            <div className="space-y-4">
              {news.map((item: NewsItem, index: number) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg transition-colors border border-slate-200 hover:border-brand-orange hover:bg-gradient-to-r from-[#ff6b2d] to-[#b91c1c]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 group-hover:text-brand-orange mb-2 line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <Badge variant="secondary" className="bg-orange-100 text-brand-red border-orange-200">
                          {item.source}
                        </Badge>
                        <span className="text-slate-500 flex items-center gap-1">
                          {new Date(item.pubDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-orange shrink-0 mt-1" />
                  </div>
                </a>
              ))}
            </div>

            {/* Paginação */}
            <SmartPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Newspaper className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-1">
              Nenhuma notícia disponível hoje
            </p>
            <p className="text-sm text-slate-500">
              Não encontramos notícias relevantes de investimentos para hoje
            </p>
          </div>
        )}
   
    </>
  );
}

