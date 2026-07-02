import { getSubjectById, getDocumentsBySubject } from '@/lib/supabase';
import { metaObject } from '@/config/site.config';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookText } from 'lucide-react';
import { DocumentCard } from '@/components/editorial/document-card';
import { InfoRow } from '@/components/editorial/info-row';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subject = await getSubjectById(id);
  if (!subject) return metaObject('Subject not found');
  return metaObject(subject.name);
}

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [subject, documents] = await Promise.all([
    getSubjectById(id),
    getDocumentsBySubject(id),
  ]);

  if (!subject) notFound();

  const nonOutlineDocs = documents.filter(doc => doc.document_type !== 'OUTLINE');

  return (
    <div className="arionear-container py-6 md:py-10">
      <Link href="/subjects" className="btn-meta mb-10 inline-flex">
        <ArrowLeft size={14} strokeWidth={1.5} /> Quay lại môn học
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Subject Info */}
        <section className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
          <div className="card p-8">
            <p className="label-mono mb-2">Thông tin môn học</p>
            <h1 className="document-title text-ink mb-8">{subject.name}</h1>

            <div className="space-y-5">
              <InfoRow label="Mã môn" value={subject.code} />
              <InfoRow label="Tín chỉ" value={`${subject.credits} tín chỉ`} />
              <InfoRow label="Tổng tiết" value={`${subject.theory_hours + subject.practice_hours + subject.exercise_hours + subject.seminar_hours} tiết`} />
            </div>

            <div className="mt-8 pt-6 border-t border-ink/20">
              <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter mb-4">Phân bổ giờ học</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Lý thuyết', hours: subject.theory_hours },
                  { label: 'Thực hành', hours: subject.practice_hours },
                  { label: 'Bài tập', hours: subject.exercise_hours },
                  { label: 'Seminar', hours: subject.seminar_hours },
                ].map((item) => (
                  <div key={item.label} className="border border-ink/20 p-4">
                    <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter mb-1">{item.label}</p>
                    <p className="font-serif text-heading-3 font-bold text-red">{item.hours}<span className="font-mono text-meta text-ink-lighter ml-1">tiết</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="lg:col-span-8">
          <div className="mb-10">
            <p className="label-red mb-3">TÀI LIỆU</p>
            <h2 className="section-heading">Tài liệu</h2>
            <p className="subheading mt-1">
              {nonOutlineDocs.length} tài liệu cho môn học này.
            </p>
          </div>

          {nonOutlineDocs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nonOutlineDocs.map((doc, i) => (
                <DocumentCard key={doc.id} doc={doc} index={i} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <BookText size={36} strokeWidth={1.5} className="mx-auto text-ink-lighter/40 mb-3" />
              <p className="text-body-sm text-ink-lighter">Chưa có tài liệu cho môn học này.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
