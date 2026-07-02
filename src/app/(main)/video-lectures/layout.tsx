import { metaObject } from '@/config/site.config';

export const metadata = metaObject('Bài giảng video');

export default function VideoLecturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
