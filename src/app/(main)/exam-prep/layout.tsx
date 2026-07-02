import { metaObject } from '@/config/site.config';

export const metadata = metaObject('Ôn thi');

export default function ExamPrepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
