'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';
import { UploadModal } from '@/components/layout/upload-modal';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuthProvider session={session}>
      {children}
      {mounted && <Toaster position="top-right" toastOptions={{ duration: 4000 }} />}
      <UploadModal />
    </AuthProvider>
  );
}
