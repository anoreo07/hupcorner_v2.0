'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { getSubjects, uploadDocument } from '@/lib/supabase';
import { Subject, DocumentType } from '@/types/database';
import { useFileUploader } from '@/hooks/use-file-uploader';
import { ArrowLeft, Search } from 'lucide-react';

export default function AdminExamPrepUploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { uploadFile } = useFileUploader();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') { router.push('/admin/login'); return; }
    getSubjects().then(setSubjects).catch(console.error);
  }, [status, session, router]);

  const filteredSubjects = subjects.filter(
    (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedFile || !title) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    setSubmitting(true);
    try {
      const uploadResult = await uploadFile(selectedFile);
      if (!uploadResult?.file_id) throw new Error('Upload failed');

      await uploadDocument({
        title,
        document_type: 'OUTLINE' as DocumentType,
        major_id: selectedSubject.major_id,
        subject_id: selectedSubject.id,
        subject_name: selectedSubject.name,
        academic_year: academicYear || null,
        storage_provider: 'telegram',
        file_path: uploadResult.file_id,
        file_name: uploadResult.file_name,
        file_size: uploadResult.file_size,
        mime_type: selectedFile.type || null,
        status: 'APPROVED',
      });

      toast.success('Đã tải lên và phê duyệt đề cương!');
      setSelectedSubject(null);
      setSelectedFile(null);
      setTitle('');
      setAcademicYear('');
    } catch (err: any) {
      toast.error(err.message || 'Tải lên thất bại');
    } finally { setSubmitting(false); }
  };

  if (status === 'loading') return null;
  if (!session || (session.user as any)?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-paper">
      <div className="arionear-container py-6 md:py-10">
        <Link href="/admin" className="btn-meta mb-8 inline-flex"><ArrowLeft size={14} strokeWidth={1.5} /> Quay lại</Link>

        <p className="label-red mb-3">ÔN THI</p>
        <h1 className="page-heading mb-2">Tải lên đề cương ôn thi</h1>
        <p className="subheading mb-12">Tải lên đề cương ôn thi cho sinh viên.</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <section className="lg:col-span-5">
            <div className="space-y-1.5 mb-6">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tìm môn học</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-lighter" size={16} strokeWidth={1.5} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-11" placeholder="Tìm theo tên hoặc mã..." />
              </div>
            </div>

            <div className="border border-ink max-h-[400px] overflow-y-auto divide-y divide-ink/20">
              {filteredSubjects.map((subject) => (
                <button key={subject.id} onClick={() => { setSelectedSubject(subject); setSearchTerm(''); }}
                  className={`w-full text-left p-4 transition-colors duration-200 ${selectedSubject?.id === subject.id ? 'bg-ink text-paper' : 'hover:bg-paper-light'}`}>
                  <p className={`font-mono text-meta uppercase tracking-[0.1em] ${selectedSubject?.id === subject.id ? 'text-paper/60' : 'text-ink-lighter'}`}>
                    {subject.code} &bull; {subject.credits} tín chỉ
                  </p>
                  <p className={`font-medium ${selectedSubject?.id === subject.id ? 'text-paper' : 'text-ink'}`}>{subject.name}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="lg:col-span-7">
            {selectedSubject ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6 mb-6">
                  <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter mb-1">Môn học đã chọn</p>
                  <p className="font-serif text-heading-4 font-bold text-ink">{selectedSubject.name}</p>
                  <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter">{selectedSubject.code}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tiêu đề *</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Năm học</label>
                  <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="input-field" placeholder="VD: 2024-2025" />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tệp *</label>
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full border border-ink bg-transparent p-3 text-body-sm file:border-0 file:bg-ink file:text-paper file:px-4 file:py-2 file:mr-4 file:text-sm" />
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Đang tải lên...' : 'Tải lên đề cương ôn thi'}
                </button>
              </form>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-body-sm text-ink-lighter">Chọn một môn học từ danh sách bên trái.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
