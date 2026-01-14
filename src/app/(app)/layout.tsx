'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loading';
import MainLayout from '@/components/ui/layout/MainLayout';
// import { useAuth } from '@/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // const { user, loading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.replace('/login');
  //   }
  // }, [loading, user, router]);

  // // Enquanto carrega (ou até ter usuário), não renderiza o menu para evitar "flash"
  // if (loading || !user) {
  //   return <Loading size="lg" fullscreen />;
  // }

  return <MainLayout>{children}</MainLayout>;
}


