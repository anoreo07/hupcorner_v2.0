import { metaObject } from '@/config/site.config';

export const metadata = metaObject('Diễn đàn');

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
