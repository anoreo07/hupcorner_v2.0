import { metaObject } from '@/config/site.config';

export const metadata = metaObject('Hồ sơ');

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
