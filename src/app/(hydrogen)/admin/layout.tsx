import { metaObject } from '@/config/site.config';

export const metadata = metaObject('Quản trị');

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
