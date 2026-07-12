'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog } from '@/components/ui/dialog';
import { useUploadModal } from '@/hooks/use-upload-modal';
import { uploadFileWithChunking, needsChunking, calculateChunks } from '@/utils/file-chunking';
import { uploadDocument, getMajors, getSubjects } from '@/lib/supabase';
import { Upload, File, X, Check, Loader2, Search } from 'lucide-react';
import type { DocumentType, Major, Subject } from '@/types/database';

type Step = 'form' | 'done';

const DESC_MAX_LENGTH = 150;

function isValidAcademicYear(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{4})$/);
  if (!match) return false;
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  return end === start + 1;
}

export function UploadModal() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isLoggedIn = !!user;
  const { isOpen, closeModal } = useUploadModal();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('form');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('OTHER');
  const [academicYear, setAcademicYear] = useState('');
  const [academicYearError, setAcademicYearError] = useState('');
  const [lecturerName, setLecturerName] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState('');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const subjectSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSelectedFile(null);
      setUploadProgress(0);
      setUploadStatus('idle');
      setUploadMessage('');
      setTitle('');
      setDocumentType('OTHER');
      setSelectedMajorId('');
      setSelectedSubject(null);
      setSubjectSearch('');
      setAcademicYear('');
      setAcademicYearError('');
      setLecturerName('');
      setDescription('');
      setAnonymous(false);
      setSubmitting(false);
      getMajors().then(setMajors).catch(() => {});
      getSubjects().then(setSubjects).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (subjectSearchRef.current && !subjectSearchRef.current.contains(e.target as Node)) {
        setShowSubjectDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadMessage('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleAcademicYearChange = (value: string) => {
    setAcademicYear(value);
    if (value && !isValidAcademicYear(value)) {
      setAcademicYearError('Định dạng không hợp lệ. VD: 2024-2025');
    } else {
      setAcademicYearError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedFile) return;
    if (academicYear && !isValidAcademicYear(academicYear)) {
      setAcademicYearError('Định dạng không hợp lệ. VD: 2024-2025');
      return;
    }
    setSubmitting(true);
    setUploadStatus('uploading');

    try {
      const channelId = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID || '-1003810443754';
      let botIndex = 1;
      try {
        const res = await fetch('/api/telegram/upload-proxy');
        if (res.ok) {
          const data = await res.json();
          if (data.bot_index) botIndex = data.bot_index;
        }
      } catch {}

      const isChunked = needsChunking(selectedFile.size);
      const chunkCount = calculateChunks(selectedFile.size);

      if (isChunked) {
        setUploadMessage(`Chia nhỏ file thành ${chunkCount} phần...`);
      }

      const fileIds = await uploadFileWithChunking(selectedFile, channelId, (progress, message) => {
        setUploadProgress(progress);
        setUploadMessage(message || (isChunked ? `Đang upload... (${progress}%)` : `Đang upload... (${progress}%)`));
      }, botIndex);

      if (!fileIds || fileIds.length === 0) throw new Error('Upload thất bại');

      const fileId = isChunked ? `chunk:${fileIds.join(',')}` : fileIds[0];
      setUploadProgress(100);
      setUploadMessage('Đang lưu thông tin...');

      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
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
        file_path: fileId,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: ext ? (mimeMap[ext] || null) : null,
        major_id: selectedMajorId || null,
        subject_id: selectedSubject?.id || null,
        subject_name: selectedSubject?.name || null,
        academic_year: academicYear || null,
        lecturer_name: lecturerName || null,
        description: description || null,
        telegram_bot_index: botIndex,
        uploader_name: isLoggedIn ? (anonymous ? 'Người dùng ẩn danh' : (user?.username || null)) : 'Người dùng ẩn danh',
      });

      setUploadStatus('success');
      setStep('done');
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage('Upload thất bại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = selectedFile && title && !submitting;

  return (
    <Dialog
      open={isOpen}
      onClose={submitting ? () => {} : closeModal}
      title={step === 'done' ? 'Tải lên thành công' : 'Tải lên tài liệu'}
      className="max-w-2xl"
    >
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed p-10 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-burgundy bg-burgundy/5' : 'border-border hover:border-ink/30'
                }`}
              >
                <Upload size={32} className="mx-auto text-ink-lighter mb-3" />
                <p className="text-body-sm text-ink font-medium mb-1">Kéo thả file vào đây</p>
                <p className="font-mono text-meta uppercase tracking-wider text-ink-lighter">hoặc nhấp để chọn file</p>
                <input ref={inputRef} type="file" className="hidden" onChange={handleInput} />
              </div>
            ) : (
              <div className="flex items-center gap-3 border border-border-light p-4">
                <File size={20} className="text-ink-lighter shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm text-ink font-medium truncate">{selectedFile.name}</p>
                  <p className="font-mono text-meta text-ink-lighter">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-ink-lighter hover:text-ink shrink-0"
                  disabled={submitting}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {uploadStatus === 'uploading' && (
              <div className="mt-3 space-y-2">
                <div className="w-full bg-ink/10 h-1.5">
                  <div
                    className="h-full bg-red transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="font-mono text-meta text-ink-lighter">{uploadMessage}</p>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="mt-3 p-3 border border-red bg-red/5">
                <p className="font-sans text-body-sm text-red">{uploadMessage}</p>
              </div>
            )}
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
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Khoa</label>
              <select
                value={selectedMajorId}
                onChange={(e) => setSelectedMajorId(e.target.value)}
                className="select-field"
              >
                <option value="">-- Chọn khoa --</option>
                {majors.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Môn học</label>
              <div className="relative" ref={subjectSearchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-lighter" size={16} strokeWidth={1.5} />
                  <input
                    type="text"
                    value={selectedSubject ? selectedSubject.name : subjectSearch}
                    onChange={(e) => { setSubjectSearch(e.target.value); setSelectedSubject(null); setShowSubjectDropdown(true); }}
                    onFocus={() => setShowSubjectDropdown(true)}
                    className="input-field pl-10"
                    placeholder="Tìm môn học..."
                  />
                  {selectedSubject && (
                    <button
                      type="button"
                      onClick={() => { setSelectedSubject(null); setSubjectSearch(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-lighter hover:text-ink"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                {showSubjectDropdown && !selectedSubject && (
                  <div className="absolute z-10 mt-1 w-full border border-ink bg-paper max-h-[200px] overflow-y-auto">
                    {filteredSubjects.length === 0 ? (
                      <div className="p-3 text-body-sm text-ink-lighter">Không tìm thấy môn học</div>
                    ) : (
                      filteredSubjects.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setSelectedSubject(s); setShowSubjectDropdown(false); }}
                          className="w-full text-left p-3 hover:bg-paper-light transition-colors"
                        >
                          <p className="font-mono text-meta text-ink-lighter">{s.code}</p>
                          <p className="text-body-sm text-ink font-medium">{s.name}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Năm học</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => handleAcademicYearChange(e.target.value)}
                className={`input-field ${academicYearError ? 'border-red' : ''}`}
                placeholder="VD: 2024-2025"
              />
              {academicYearError && (
                <p className="font-sans text-caption text-red">{academicYearError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Giảng viên</label>
              <input type="text" value={lecturerName} onChange={(e) => setLecturerName(e.target.value)} className="input-field" placeholder="Tên giảng viên" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">
                Mô tả ({description.length}/{DESC_MAX_LENGTH})
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX_LENGTH))}
                className="input-field min-h-[80px]"
                placeholder="Mô tả ngắn về tài liệu (tối đa 150 ký tự)"
                maxLength={DESC_MAX_LENGTH}
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Người tải lên</label>
              <div className="flex items-center gap-4 py-3">
                {isLoggedIn ? (
                  <>
                    <span className="text-body-sm text-ink font-medium">
                      {anonymous ? 'Người dùng ẩn danh' : `@${user?.username || 'user'}`}
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
                  </>
                ) : (
                  <span className="text-body-sm text-ink-lighter italic">
                    Người dùng ẩn danh
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={closeModal} className="btn-outline flex-1" disabled={submitting}>
              Huỷ
            </button>
            <button type="submit" disabled={!canSubmit} className="btn-primary flex-1 disabled:opacity-50">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> {uploadMessage || 'Đang xử lý...'}
                </span>
              ) : (
                'Lưu thông tin tài liệu'
              )}
            </button>
          </div>
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
