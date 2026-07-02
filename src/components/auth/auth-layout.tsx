'use client';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <a href="/home" className="btn-outline text-xs px-4 py-2">
            ← Trang chủ
          </a>
        </div>
        <div className="card p-8 md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
