'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Home, BookOpen, GraduationCap, FileText, Video, MessageCircle, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const sidebarItems = [
  { href: '/home', label: 'Trang chủ', icon: Home },
  { href: '/all-majors', label: 'Tài liệu', icon: BookOpen },
  { href: '/subjects', label: 'Môn học', icon: GraduationCap },
  { href: '/exam-prep', label: 'Ôn thi', icon: FileText },
  { href: '/video-lectures', label: 'Bài giảng', icon: Video, requiredRole: 'PHARMACY_STUDENT' },
  { href: '/forum', label: 'Diễn đàn', icon: MessageCircle },
  { href: '/feedback', label: 'Đánh giá', icon: Star },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  const isActive = (href: string) => {
    if (href === '/home') return pathname === '/home' || pathname === '/';
    return pathname.startsWith(href);
  };

  const handleRestrictedClick = (e: React.MouseEvent, item: typeof sidebarItems[0]) => {
    if (item.requiredRole) {
      const userRole = user?.role;
      if (userRole !== 'PHARMACY_STUDENT' && userRole !== 'ADMIN') {
        e.preventDefault();
        toast.error('Bạn cần là sinh viên Dược để truy cập mục này.');
      }
    }
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-ink/40 z-30" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed top-16 md:top-20 left-0 z-40 w-64 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-paper border-r border-ink overflow-y-auto transition-transform duration-200 flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <span className="font-mono text-meta uppercase tracking-widest text-ink-lighter">Menu</span>
          <button onClick={onClose} className="text-ink-lighter hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <nav className="py-3 flex-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleRestrictedClick(e, item)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 font-sans text-body-sm transition-colors border-l-2',
                  active
                    ? 'text-ink font-semibold border-l-red bg-red/5'
                    : 'text-ink-lighter font-normal border-l-transparent hover:text-ink hover:bg-paper-light'
                )}
              >
                <Icon size={18} className={active ? 'text-red' : ''} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
