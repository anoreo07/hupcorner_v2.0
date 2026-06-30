'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useUploadModal } from '@/hooks/use-upload-modal';

const navItems = [
  { href: '/home', label: 'Trang chủ' },
  { href: '/all-majors', label: 'Tài liệu' },
  { href: '/subjects', label: 'Môn học' },
  { href: '/exam-prep', label: 'Ôn thi' },
  { href: '/feedback', label: 'Đánh giá' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { openModal } = useUploadModal();

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-ink bg-paper">
      {/* Main nav */}
      <div className="arionear-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/home">
            <span className="font-serif font-bold text-ink text-2xl md:text-3xl leading-none tracking-tight">HUP Corner</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'nav-link',
                  isActive(item.href) && 'nav-link-active'
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={openModal}
              className="btn-primary text-sm py-2 px-4"
            >
              <Upload size={14} /> Tải lên
            </button>
          </nav>

          <button
            className="md:hidden p-2 text-ink-lighter hover:text-ink transition-colors duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* News ticker */}
      <div className="news-ticker border-t border-ink/10">
        <div className="news-ticker-inner">
          <span>KHO TÀNG TRI THỨC HỌC THUẬT DÀNH CHO SINH VIÊN HUP</span>
          <span className="text-red">■</span>
          <span>ĐỀ THI • BÀI GIẢNG • GIÁO TRÌNH</span>
          <span className="text-red">■</span>
          <span>ĐÓNG GÓP VÀ CHIA SẺ TRI THỨC</span>
          <span className="text-red">■</span>
          <span>MIỄN PHÍ CHO CỘNG ĐỒNG HUP</span>
          <span className="text-red">■</span>
          <span>KHO TÀNG TRI THỨC HỌC THUẬT DÀNH CHO SINH VIÊN HUP</span>
          <span className="text-red">■</span>
          <span>ĐỀ THI • BÀI GIẢNG • GIÁO TRÌNH</span>
          <span className="text-red">■</span>
          <span>ĐÓNG GÓP VÀ CHIA SẺ TRI THỨC</span>
          <span className="text-red">■</span>
          <span>MIỄN PHÍ CHO CỘNG ĐỒNG HUP</span>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink bg-paper">
          <div className="arionear-container py-6 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block font-mono text-meta uppercase tracking-[0.15em] transition-colors duration-200',
                  isActive(item.href) ? 'text-ink' : 'text-ink-lighter hover:text-ink'
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { openModal(); setMobileOpen(false); }}
              className="btn-primary w-full text-sm py-2.5"
            >
              <Upload size={14} /> Tải lên
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
