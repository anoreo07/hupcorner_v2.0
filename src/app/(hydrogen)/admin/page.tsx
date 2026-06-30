'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const modules = [
  { title: 'Kiểm duyệt tài liệu', description: 'Xem xét và phê duyệt tài liệu do sinh viên gửi lên.', href: '/admin/dashboard', label: 'Mô-đun chính' },
  { title: 'Tải lên tài liệu môn học', description: 'Tải lên tài liệu đã duyệt vào các môn học.', href: '/admin/subjects/upload', label: 'Nội dung học thuật' },
  { title: 'Thông báo', description: 'Đăng thông báo hiển thị trên trang chủ.', href: '/admin/notifications', label: 'Truyền thông' },
  { title: 'Tải lên đề cương ôn thi', description: 'Tải lên đề cương ôn thi cho sinh viên.', href: '/admin/exam-prep/upload', label: 'Ôn thi' },
];

export default function AdminPortalPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/admin/login');
    }
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Đã đăng xuất');
    router.push('/admin/login');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="w-8 h-8 border-2 border-ink/10 border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-6 md:py-10">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="label-red mb-2">QUẢN TRỊ HỆ THỐNG</p>
            <h1 className="page-heading">
              Xin chào, <span className="text-red">{(session.user as any)?.name || 'Admin'}</span>
            </h1>
            <p className="subheading mt-2">Quản lý nền tảng HUP Corner.</p>
          </div>
          <button onClick={handleLogout} className="btn-outline hidden md:flex">Đăng xuất</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod) => (
            <Link key={mod.href} href={mod.href} className="card p-8 group">
              <p className="label-mono mb-2">{mod.label}</p>
              <h2 className="font-serif text-heading-3 font-bold text-ink mb-3 transition-colors duration-200 group-hover:text-red">{mod.title}</h2>
              <p className="text-body-sm text-ink-lighter">{mod.description}</p>
              <div className="mt-6 font-mono text-meta uppercase tracking-[0.15em] text-ink transition-colors duration-200">
                Bắt đầu &rarr;
              </div>
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} className="btn-outline mt-8 md:hidden w-full">Đăng xuất</button>

        <div className="text-center mt-16 border-t border-ink/20 pt-8">
          <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">HUP Corner &middot; Hệ thống Quản trị &middot; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
