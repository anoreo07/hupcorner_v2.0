import { getSubjects } from '@/lib/supabase';
import { metaObject } from '@/config/site.config';
import SubjectsList from './subjects-list-client';

export const metadata = { ...metaObject('Subjects') };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SubjectsPage() {
  const subjects = await getSubjects();
  return (
    <div className="editorial-container py-4 md:py-6">
      <SubjectsList initialSubjects={subjects} />
    </div>
  );
}
