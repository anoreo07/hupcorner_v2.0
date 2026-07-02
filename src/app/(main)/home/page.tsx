import { getApprovedDocuments, getMajors } from '@/lib/supabase';
import { metaObject } from '@/config/site.config';
import HomePageClient from './home-client';

export const metadata = { ...metaObject() };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [approvedDocs, majors] = await Promise.all([
    getApprovedDocuments().catch(() => []),
    getMajors().catch(() => []),
  ]);

  const featuredDocuments = approvedDocs.slice(0, 6);
  const recentDocuments = approvedDocs.slice(0, 10);

  return <HomePageClient featuredDocuments={featuredDocuments} recentDocuments={recentDocuments} majors={majors} />;
}
