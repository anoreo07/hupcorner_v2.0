'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <div className={cn(
          'shrink-0 transition-all duration-200',
          sidebarOpen ? 'w-64' : 'w-0 md:w-16'
        )}>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        <main className={cn(
          'flex-1 min-w-0 transition-all duration-200',
          sidebarOpen ? '' : ''
        )}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
