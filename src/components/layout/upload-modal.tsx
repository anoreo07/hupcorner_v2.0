'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog } from '@/components/ui/dialog';
import { useUploadModal } from '@/hooks/use-upload-modal';
import { uploadFileWithChunking, needsChunking, calculateChunks } from '@/utils/file-chunking';
import { uploadDocument, getMajors, getSubjects } from '@/lib/supabase';
import { Upload, File, X, Check, Loader2, Search, BookOpen, Video, ArrowLeft } from 'lucide-react';
import type { DocumentType, Major, Subject } from '@/types/database';

type Step = 'choose' | 'document-form' | 'video-form' | 'done';

const DESC_MAX_LENGTH = 150;

function isValidAcademicYear(value: string): boolean {
  const match = value.match(/^(\d{4})-(\d{4})$/);
  if (!match) return false;
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10);
  return end === start + 1;
}

function isValidYoutubeUrl(value: string): boolean {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/.test(value);
}

export function UploadModal() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isLoggedIn = !!user;
  const role = user?.role;
  const isPharmacyStudent = role === 'PHARMACY_STUDENT' || role === 'ADMIN';
  const { isOpen, closeModal, uploadType } = useUploadModal();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('choose');
  const [isVideoUpload, setIsVideoUpload] = useState(false);

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

  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoLecturer, setVideoLecturer] = useState('');
  const [videoSubjectName, setVideoSubjectName] = useState('');
  const [videoSubjectCode, setVideoSubjectCode] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoMajorId, setVideoMajorId] = useState('');
  const [videoError, setVideoError] = useState('');
  const [videoSubmitting, setVideoSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(uploadType === 'document' ? 'document-form' : uploadType === 'video' ? 'video-form' : 'choose');
      resetForm();
      getMajors().then(setMajors).catch(() => {});
      getSubjects().then(setSubjects).catch(() => {});
    }
  }, [isOpen, uploadType]);

  function resetForm() {
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
    setVideoTitle('');
    setVideoUrl('');
    setVideoLecturer('');
    setVideoSubjectName('');
    setVideoSubjectCode('');
    setVideoDescription('');
    setVideoMajorId('');
    setVideoError('');
    setVideoSubmitting(false);
    setIsVideoUpload(false);
  }

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

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError('');

    if (!videoTitle || !videoUrl) {
      setVideoError('Vui lòng điền tiêu đề và link bài giảng');
      return;
    }
    if (!isValidYoutubeUrl(videoUrl)) {
      setVideoError('Link YouTube không hợp lệ. VD: https://www.youtube.com/watch?v=...');
      return;
    }

    setVideoSubmitting(true);
    try {
      const res = await fetch('/api/video-lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoTitle,
          youtube_url: videoUrl,
          lecturer_name: videoLecturer || null,
          subject_name: videoSubjectName || null,
          subject_code: videoSubjectCode || null,
          description: videoDescription || null,
          major_id: videoMajorId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Không thể đăng bài giảng');
      }

      setStep('done');
    } catch (err: any) {
      setVideoError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setVideoSubmitting(false);
    }
  };

  const canSubmit = selectedFile && title && !submitting;

  const modalTitle = step === 'done' ? 'Tải lên thành công'
    : step === 'choose' ? 'Bạn muốn đóng góp?'
    : step === 'video-form' ? 'Đăng bài giảng'
    : 'Tải lên tài liệu';

  return (
    <Dialog
      open={isOpen}
      onClose={submitting || videoSubmitting ? () => {} : closeModal}
      title={modalTitle}
      className="max-w-2xl"
    >
      {/* Step: Choose */}
      {step === 'choose' && (
        <div className="space-y-6 py-4">
          <p className="text-body-sm text-ink-lighter text-center">
            Chọn loại nội dung bạn muốn đóng góp cho cộng đồng
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => { setStep('document-form'); setIsVideoUpload(false); }}
              className="border-2 border-ink p-8 text-center hover:bg-ink/5 transition-colors group"
            >
              <BookOpen size={40} className="mx-auto text-ink-lighter group-hover:text-ink transition-colors" />
              <h3 className="font-serif font-bold text-lg text-ink mt-4">Tài liệu</h3>
              <p className="font-sans text-body-sm text-ink-lighter mt-2">
                Đề thi, bài giảng, giáo trình, đề cương,...
              </p>
            </button>
            <button
              onClick={() => { setStep('video-form'); setIsVideoUpload(true); }}
              className="border-2 border-ink p-8 text-center hover:bg-ink/5 transition-colors group"
            >
              <Video size={40} className="mx-auto text-ink-lighter group-hover:text-ink transition-colors" />
              <h3 className="font-serif font-bold text-lg text-ink mt-4">Video bài giảng</h3>
              <p className="font-sans text-body-sm text-ink-lighter mt-2">
                Chia sẻ video bài giảng từ YouTube
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step: Video Form */}
      {step === 'video-form' && (
        <form onSubmit={handleVideoSubmit} className="space-y-5">
          <div className="bg-ink/5 border border-ink/20 p-4 space-y-2">
            <p className="font-serif font-bold text-ink text-sm">Hướng dẫn đăng bài giảng</p>
            <ol className="font-sans text-body-sm text-ink-lighter list-decimal list-inside space-y-1">
              <li>Tìm video bài giảng trên YouTube</li>
              <li>Sao chép đường dẫn (URL) từ thanh địa chỉ</li>
              <li>Điền thông tin bài giảng vào form bên dưới</li>
              <li>Nhấn "Đăng bài giảng" để chia sẻ với cộng đồng</li>
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tiêu đề *</label>
              <input type="text" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} className="input-field" placeholder="VD: Bài 1 - Đại cương về dược lý" required />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Link bài giảng (YouTube) *</label>
              <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input-field" placeholder="https://www.youtube.com/watch?v=..." required />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Giảng viên</label>
              <input type="text" value={videoLecturer} onChange={(e) => setVideoLecturer(e.target.value)} className="input-field" placeholder="Tên giảng viên" />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Khoa</label>
              <select value={videoMajorId} onChange={(e) => setVideoMajorId(e.target.value)} className="select-field">
                <option value="">-- Chọn khoa --</option>
                {majors.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Tên môn học</label>
              <input type="text" value={videoSubjectName} onChange={(e) => setVideoSubjectName(e.target.value)} className="input-field" placeholder="VD: Dược lý" />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Mã môn học</label>
              <input type="text" value={videoSubjectCode} onChange={(e) => setVideoSubjectCode(e.target.value)} className="input-field" placeholder="VD: DL101" />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Mô tả</label>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="input-field min-h-[80px]"
                placeholder="Mô tả ngắn về bài giảng"
              />
            </div>
          </div>

          {videoError && (
            <div className="p-3 border border-red bg-red/5">
              <p className="font-sans text-body-sm text-red">{videoError}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep('choose')} className="btn-outline flex-1" disabled={videoSubmitting}>
              <span className="flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Quay lại
              </span>
            </button>
            <button type="submit" disabled={videoSubmitting || !videoTitle || !videoUrl} className="btn-primary flex-1 disabled:opacity-50">
              {videoSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Đang đăng...
                </span>
              ) : (
                'Đăng bài giảng'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step: Document Form */}
      {step === 'document-form' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {isPharmacyStudent && (
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="font-mono text-meta text-ink-lighter hover:text-ink flex items-center gap-1"
            >
              <ArrowLeft size={12} /> Quay lại
            </button>
          )}

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

      {/* Step: Done (success) */}
      {step === 'done' && (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 flex items-center justify-center mx-auto border border-ink bg-ink/5">
            <Check size={32} className="text-ink" />
          </div>
          <div>
            <p className="text-heading-4 font-serif font-bold text-ink">Tải lên thành công!</p>
            <p className="text-body-sm text-ink-lighter mt-1">
              {isVideoUpload ? 'Bài giảng của bạn đã được đăng tải.' : 'Tài liệu của bạn đã được gửi và chờ phê duyệt.'}
            </p>
          </div>
          <button onClick={closeModal} className="btn-primary">
            Đóng
          </button>
        </div>
      )}
    </Dialog>
  );
}
