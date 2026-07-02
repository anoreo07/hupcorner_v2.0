'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email hoặc mật khẩu không đúng');
        return;
      }

      router.push('/home');
      router.refresh();
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/home' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink tracking-tight">ĐĂNG NHẬP</h2>
        <p className="font-sans text-body-sm text-ink-lighter mt-1">
          Đăng nhập để khám phá kho tài liệu
        </p>
      </div>

      {error && (
        <div className="border-2 border-red px-4 py-3 bg-red/5">
          <p className="font-sans text-body-sm text-red font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
          Email học viên
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full border border-ink bg-gray-100/50 px-4 py-3 text-body-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
            Mật khẩu
          </label>
          <span className="font-mono text-meta uppercase tracking-widest text-red cursor-pointer hover:underline">
            Quên mật khẩu?
          </span>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full border border-ink bg-gray-100/50 px-4 py-3 text-body-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none transition-colors pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-lighter hover:text-ink"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-ink text-paper px-7 py-3.5 text-body-sm font-sans font-medium uppercase tracking-[0.08em] shadow-[6px_6px_0px_0px_#D43B2C] hover:shadow-[4px_4px_0px_0px_#D43B2C] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        Đăng nhập →
      </button>

      <div className="relative flex items-center gap-4 py-2">
        <div className="flex-1 border-t border-ink/20" />
        <span className="font-mono text-meta uppercase tracking-widest text-ink-lighter shrink-0">HOẶC TIẾP TỤC VỚI</span>
        <div className="flex-1 border-t border-ink/20" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-3 text-body-sm font-sans font-medium uppercase tracking-[0.08em] hover:bg-ink hover:text-paper transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 border-2 border-ink bg-paper px-4 py-3 text-body-sm font-sans font-medium uppercase tracking-[0.08em] hover:bg-ink hover:text-paper transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          Github
        </button>
      </div>

      <p className="text-center font-sans text-body-sm text-ink-lighter">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-red font-semibold hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
}
