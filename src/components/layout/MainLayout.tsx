'use client';

import { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  CreditCard,
  Mail,
  Menu,
  User,
  Newspaper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { SidebarNav } from './SidebarNav';


interface MenuItem {
  text: string;
  icon: ReactNode;
  path: string;
  requiresPaid?: boolean;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { text: 'Perfil', icon: <User className="w-5 h-5" />, path: '/perfil' },
  { text: 'Investimentos', icon: <TrendingUp className="w-5 h-5" />, path: '/investimentos' },
  { text: 'Notícias', icon: <Newspaper className="w-5 h-5" />, path: '/noticias' },
  { text: 'Planos', icon: <CreditCard className="w-5 h-5" />, path: '/planos' },
  { text: 'Contato', icon: <Mail className="w-5 h-5" />, path: '/contato' },
];

export default function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
          <SidebarNav menuItems={menuItems} />
        </div>
      </aside>

      {/* Mobile Sidebar - usando Sheet do shadcn/ui */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarNav menuItems={menuItems} onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar Mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-[var(--border)] bg-[var(--card)] px-4 shadow-sm lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="-m-2.5"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              {menuItems.find(item => item.path === pathname)?.text || 'Finanças Pro'}
            </h2>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
