'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('admin-credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Thông tin đăng nhập không hợp lệ');
      } else {
        toast.success('Xin chào, Admin');
        router.push('/admin/dashboard');
      }
    } catch {
      toast.error('Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <span className="font-serif font-bold text-ink text-3xl leading-none block mb-4">HUP</span>
          <h1 className="font-serif text-heading-2 font-bold text-ink">Truy cập Quản trị</h1>
          <p className="text-body-sm text-ink-lighter mt-1">Bảng điều khiển HUP Corner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
