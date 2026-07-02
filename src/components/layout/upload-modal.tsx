'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Dialog } from '@/components/ui/dialog';
import { useUploadModal } from '@/hooks/use-upload-modal';
import { useFileUploader } from '@/hooks/use-file-uploader';
import { uploadDocument } from '@/lib/supabase';
import { Upload, File, X, Check, AlertCircle, Loader2, LogIn } from 'lucide-react';
import type { DocumentType } from '@/types/database';

type Step = 'upload' | 'form' | 'done';

export function UploadModal() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isLoggedIn = !!user;
  const { isOpen, closeModal } = useUploadModal();
  const { uploadFile, uploads, clearUploads, removeUpload } = useFileUploader();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [currentResult, setCurrentResult] = useState<any>(null);

  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('OTHER');
  const [subjectName, setSubjectName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('upload');
      setCurrentResult(null);
      clearUploads();
      setTitle('');
      setDocumentType('OTHER');
      setSubjectName('');
      setAcademicYear('');
      setLecturerName('');
      setDescription('');
      setAnonymous(false);
      setSubmitting(false);
    }
  }, [isOpen, clearUploads]);

  const handleFile = async (file: File) => {
    const result = await uploadFile(file);
    if (result) {
      setCurrentResult(result);
      setStep('form');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !currentResult) return;
    setSubmitting(true);
    try {
      const ext = currentResult.file_name?.split('.').pop()?.toLowerCase();
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf', doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      };
      await uploadDocument({
        title,
        document_type: documentType,
        storage_provider: 'telegram',
        file_path: currentResult.file_id,
        file_name: currentResult.file_name,
        file_size: currentResult.file_size,
        mime_type: ext ? (mimeMap[ext] || null) : null,
        subject_name: subjectName || null,
        academic_year: academicYear || null,
        lecturer_name: lecturerName || null,
        description: description || null,
        uploader_name: anonymous ? null : (user?.username || null),
      });
      setStep('done');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isUploading = uploads.some(u => u.status === 'uploading');

  return (
    <Dialog
      open={isOpen}
      onClose={isUploading ? () => {} : closeModal}
      title={step === 'done' ? 'Tải lên thành công' : 'Tải lên tài liệu'}
      className="max-w-2xl"
    >
      {step === 'upload' && !isLoggedIn && (
        <div className="text-center py-8">
          <div className="w-12 h-12 border border-ink bg-ink text-paper flex items-center justify-center mx-auto mb-4">
            <LogIn size={20} />
          </div>
          <h3 className="font-serif text-heading-3 font-bold text-ink mb-2">Yêu cầu đăng nhập</h3>
          <p className="text-body-sm text-ink-lighter mb-6">
            Bạn cần đăng nhập để tải tài liệu lên.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn-primary" onClick={closeModal}>
              Đăng nhập
            </Link>
            <button onClick={closeModal} className="btn-outline">
              Để sau
            </button>
          </div>
        </div>
      )}

      {step === 'upload' && isLoggedIn && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && inputRef.current?.click()}
            className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-burgundy bg-burgundy/5' : 'border-border hover:border-ink/30'
            }`}
          >
            <Upload size={32} className="mx-auto text-ink-lighter mb-3" />
            <p className="text-body-sm text-ink font-medium mb-1">Kéo thả file vào đây</p>
            <p className="font-mono text-meta uppercase tracking-wider text-ink-lighter">hoặc nhấp để chọn file</p>
            <input ref={inputRef} type="file" className="hidden" onChange={handleInput} />
          </div>

          {uploads.length > 0 && (
            <div className="space-y-3">
              {uploads.map((u, i) => (
                <div key={i} className="flex items-center gap-3 border border-border-light p-4">
                  {u.status === 'uploading' ? (
                    <div className="w-5 h-5 border-2 border-ink/10 border-t-ink rounded-full animate-spin shrink-0" />
                  ) : u.status === 'success' ? (
                    <Check size={20} className="text-olive shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="text-burgundy shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm text-ink font-medium truncate">{u.fileName}</p>
                    <p className="font-mono text-meta text-ink-lighter">{u.message || (u.status === 'uploading' ? `${u.progress}%` : '')}</p>
                  </div>
                  <button onClick={() => removeUpload(i)} className="text-ink-lighter hover:text-ink shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="font-mono text-meta text-ink-lighter">Hỗ trợ: PDF, DOC, DOCX, PPT, JPG, PNG</p>
            <button onClick={closeModal} className="btn-outline text-sm" disabled={isUploading}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {step === 'form' && currentResult && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 border border-border-light p-4">
            <File size={20} className="text-ink-lighter shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-ink font-medium truncate">{currentResult.file_name}</p>
              <p className="font-mono text-meta text-ink-lighter">
                {currentResult.file_size ? `${(currentResult.file_size / 1024 / 1024).toFixed(2)} MB` : ''}
              </p>
            </div>
            <Check size={20} className="text-olive shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tiêu đề *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Nhập tiêu đề tài liệu" required />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Loại tài liệu</label>
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value as DocumentType)} className="select-field">
                <option value="EXAM">Đề thi</option>
                <option value="SLIDE">Bài giảng</option>
                <option value="TEXTBOOK">Giáo trình</option>
                <option value="OUTLINE">Đề cương</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tên môn học</label>
              <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="input-field" placeholder="VD: Toán cao cấp" />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Năm học</label>
              <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="input-field" placeholder="2024-2025" />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Giảng viên</label>
              <input type="text" value={lecturerName} onChange={(e) => setLecturerName(e.target.value)} className="input-field" placeholder="Tên giảng viên" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Mô tả</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-[80px]" placeholder="Mô tả ngắn về tài liệu" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Người tải lên</label>
              <div className="flex items-center gap-4">
                <span className="text-body-sm text-ink font-medium py-3">
                  {anonymous ? 'Ẩn danh' : `@${user?.username || 'user'}`}
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="w-4 h-4 border border-ink"
                  />
                  <span className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Ẩn danh</span>
                </label>
              </div>
            </div>
          </div>

          <button type="submit" disabled={submitting || !title} className="btn-primary w-full">
            {submitting ? (
              <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Đang lưu...</span>
            ) : (
              'Lưu thông tin tài liệu'
            )}
          </button>
        </form>
      )}

      {step === 'done' && (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 flex items-center justify-center mx-auto border border-ink bg-ink/5">
            <Check size={32} className="text-ink" />
          </div>
          <div>
            <p className="text-heading-4 font-serif font-bold text-ink">Tải lên thành công!</p>
            <p className="text-body-sm text-ink-lighter mt-1">Tài liệu của bạn đã được gửi và chờ phê duyệt.</p>
          </div>
          <button onClick={closeModal} className="btn-primary">
            Đóng
          </button>
        </div>
      )}
    </Dialog>
  );
}
