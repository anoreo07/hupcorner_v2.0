'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, Upload, User, LogOut, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useUploadModal } from '@/hooks/use-upload-modal';
import { AnimatedLogo } from './animated-logo';

interface HeaderProps {
  onMenuToggle?: () => void;
}

function ActionButton({
  children,
  onClick,
  href,
  color = '#111',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  color?: string;
  className?: string;
}) {
  const baseClass =
    'px-3 py-1.5 text-caption font-sans font-medium uppercase tracking-[0.08em] text-white ' +
    'border-2 border-ink transition-all duration-150 ' +
    'hover:translate-x-[2px] hover:translate-y-[2px] ' +
    className;

  const style = {
    backgroundColor: color,
    boxShadow: '4px 4px 0px 0px #111111',
  };

  const handleEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.boxShadow = '2px 2px 0px 0px #111111';
  };
  const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.boxShadow = '4px 4px 0px 0px #111111';
  };

  if (href) {
    return (
      <Link href={href} className={baseClass} style={style} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClass} style={style} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
    </button>
  );
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const { openModal } = useUploadModal();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user as any;
  const isLoggedIn = status === 'authenticated' && user;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink bg-paper">
      <div className="flex items-center justify-between h-16 md:h-20 px-4 md:px-8 lg:px-12">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 text-ink-lighter hover:text-ink transition-colors"
            aria-label="Mở menu"
          >
            <Menu size={24} />
          </button>
          <Link href="/home">
            <AnimatedLogo />
          </Link>
        </div>

        {/* Right: upload + auth */}
        <div className="flex items-center gap-3">
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-ink text-paper px-3 py-1.5 text-caption font-sans font-medium uppercase tracking-[0.08em] hover:bg-ink/90 transition-colors"
          >
            <Upload size={14} /> Tải lên
          </button>

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 border-2 border-ink px-3 py-1.5 hover:bg-ink/5 transition-colors"
              >
                <div className="w-7 h-7 border border-ink overflow-hidden bg-ink-lighter flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={`/api/telegram/preview?fileId=${encodeURIComponent(user.avatar_url)}&preview=true&mimeType=image/jpeg`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-paper text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <span className="font-sans text-body-sm text-ink font-medium hidden sm:inline">@{user.username || 'user'}</span>
                <ChevronDown size={14} className="text-ink-lighter" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 border-2 border-ink bg-paper shadow-[6px_6px_0px_0px_#111] z-50">
                  <div className="px-4 py-3 border-b border-ink/20">
                    <p className="font-serif font-bold text-ink text-sm truncate">{user.name}</p>
                    <p className="font-mono text-meta text-ink-lighter">@{user.username || 'user'}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-sans text-body-sm text-ink hover:bg-paper-light transition-colors"
                  >
                    <User size={14} />
                    Xem trang cá nhân
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/home' })}
                    className="w-full flex items-center gap-3 px-4 py-3 font-sans text-body-sm text-red border-t border-ink/20 hover:bg-paper-light transition-colors"
                  >
                    <LogOut size={14} />
                    Đăng xuất tài khoản
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center">
              <ActionButton href="/login" color="#D43B2C">Đăng nhập</ActionButton>
            </div>
          )}
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
    </header>
  );
}
