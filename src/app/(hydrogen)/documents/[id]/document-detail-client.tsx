'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, ArrowLeft, FileText, ZoomIn, ZoomOut,
  Maximize2, X, Verified, Bookmark, Share2, ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DocumentWithMajor } from '@/types/database';
import { InfoRow } from '@/components/editorial/info-row';
import { StarRating } from '@/components/ui/star-rating';
import { supabase } from '@/lib/supabase';
import { downloadFileParallel } from '@/utils/file-chunking';
import { toast } from 'react-hot-toast';
import { documentTypeLabels, documentTypeVariants } from '@/components/editorial/document-card';

interface DocumentDetailClientProps {
  document: DocumentWithMajor;
  relatedDocuments: DocumentWithMajor[];
}

export default function DocumentDetailClient({ document, relatedDocuments }: DocumentDetailClientProps) {
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const lastIncrementedId = useRef<string | null>(null);

  useEffect(() => {
    window.document.body.style.overflow = isMaximized ? 'hidden' : '';
    return () => { window.document.body.style.overflow = ''; };
  }, [isMaximized]);

  useEffect(() => {
    if (lastIncrementedId.current === document.id) return;
    lastIncrementedId.current = document.id;
    supabase.rpc('increment_view_count', { doc_id: document.id });
  }, [document.id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết');
    }
  };

  const getPreviewUrl = () => {
    const fileNameLower = (document.file_name || '').toLowerCase();
    const isPdf = fileNameLower.endsWith('.pdf') || document.mime_type === 'application/pdf';
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(fileNameLower) || document.mime_type?.startsWith('image/');
    const isOffice = /\.(docx|doc|pptx|ppt|xlsx|xls)$/i.test(fileNameLower) || document.mime_type?.includes('officedocument') || document.mime_type?.includes('msword');

    const targetMime = isPdf ? 'application/pdf' : (isImage ? (document.mime_type || 'image/jpeg') : 'application/octet-stream');
    let rawUrl = '';

    if (document.storage_provider === 'telegram') {
      const botQuery = document.telegram_bot_index ? `&botIndex=${document.telegram_bot_index}` : '';
      rawUrl = `/api/telegram/download?fileId=${encodeURIComponent(document.file_path)}&fileName=${encodeURIComponent(document.file_name || document.title)}&preview=true&mimeType=${encodeURIComponent(targetMime)}${botQuery}`;
    } else {
      const { data } = supabase.storage.from('documents').getPublicUrl(document.file_path);
      rawUrl = data.publicUrl;
    }

    if (isOffice) {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) return rawUrl;
      return `https://docs.google.com/gview?url=${encodeURIComponent(origin + rawUrl)}&embedded=true`;
    }

    return rawUrl;
  };

  const handleDownload = async () => {
    setDownloading(true);
    const toastId = toast.loading('Đang chuẩn bị tải xuống...');
    try {
      if (document.storage_provider === 'telegram') {
        await downloadFileParallel(document.file_path, document.file_name || document.title, (p, msg) => {
          if (msg) toast.loading(msg, { id: toastId });
        }, document.telegram_bot_index || 1);
      } else {
        const { data } = supabase.storage.from('documents').getPublicUrl(document.file_path);
        window.open(data.publicUrl, '_blank');
      }
      await supabase.rpc('increment_download_count', { doc_id: document.id });
      toast.success('Tải xuống hoàn tất!', { id: toastId });
    } catch {
      toast.error('Tải xuống thất bại.', { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackRating) { toast.error('Vui lòng chọn số sao'); return; }
    setSubmittingFeedback(true);
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();
      await supabase.from('site_reviews').insert([{
        rating: feedbackRating,
        title: `Đánh giá: ${document.title}`,
        content: feedbackText || 'Không có nhận xét',
        ip_address: ip,
        is_anonymous: true,
      }]);
      toast.success('Cảm ơn bạn đã đánh giá!');
      setFeedbackRating(0);
      setFeedbackText('');
    } catch (err: any) {
      toast.error(err.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const fileSize = document.file_size ? `${(document.file_size / (1024 * 1024)).toFixed(1)} MB` : '—';
  const fileType = document.mime_type?.includes('pdf') ? 'PDF' : (document.mime_type?.includes('word') || document.mime_type?.includes('document') ? 'DOC' : 'Khác');
  const downloadCount = document.download_count || 0;
  const viewCount = document.view_count || 0;
  const previewUrl = getPreviewUrl();

  return (
    <div className="arionear-container py-10 md:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter mb-10">
        <Link href="/home" className="hover:text-ink transition-colors">Trang chủ</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <Link href="/all-majors" className="hover:text-ink transition-colors">Tài liệu</Link>
        <ChevronRight size={12} strokeWidth={1.5} />
        <span className="text-ink truncate max-w-[200px]">{document.title}</span>
      </nav>

      {/* Title + Meta */}
      <div className="mb-10 max-w-content">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="document-title text-ink">{document.title}</h1>
          {document.status === 'APPROVED' && (
            <span className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-[0.1em] px-3 py-1 border border-ink/20 text-ink bg-ink/5 shrink-0">
              <Verified size={12} strokeWidth={1.5} /> Đã xác minh
            </span>
          )}
        </div>
        <p className="text-body-sm text-ink-lighter">
          {document.majors?.name || 'Đa khoa'} • {document.subject_name || 'Chung'} {document.academic_year ? `• Năm ${document.academic_year}` : ''}
        </p>
      </div>

      {/* PDF Preview — Full Width */}
      <div className="relative bg-ink/[0.02] border border-ink/20 overflow-hidden min-h-[500px] md:min-h-[700px] flex items-center justify-center group mb-0">
        {loadingPreview && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-paper/80">
            <div className="w-8 h-8 border-2 border-ink/10 border-t-ink animate-spin mb-4" />
            <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">Đang tải...</p>
          </div>
        )}
        <div
          className="transition-transform duration-300 ease-out flex justify-center w-full h-full"
          style={{ transform: `scale(${zoom})` }}
        >
          <iframe
            src={previewUrl}
            className="w-full h-[500px] md:h-[700px] border-none bg-white"
            title={document.title}
            onLoad={() => setLoadingPreview(false)}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between border border-t-0 border-ink/20 bg-ink/[0.02] px-4 md:px-6 py-3 mb-16">
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
            className="p-2 text-ink-lighter hover:text-ink hover:bg-ink/5 transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <span className="font-mono text-meta text-ink-lighter w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
            className="p-2 text-ink-lighter hover:text-ink hover:bg-ink/5 transition-colors"
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2 text-sm font-medium tracking-[0.05em] uppercase hover:bg-ink/90 transition-colors duration-200 disabled:opacity-50"
            title="Tải xuống"
          >
            <Download size={16} strokeWidth={1.5} className={downloading ? 'animate-bounce' : ''} />
            <span className="hidden sm:inline">Tải xuống</span>
          </button>
          <div className="w-px h-5 bg-ink/20 mx-1 hidden sm:block" />
          <button
            onClick={() => setBookmarked(b => !b)}
            className={`p-2 transition-colors ${bookmarked ? 'text-red' : 'text-ink-lighter hover:text-ink'}`}
            title={bookmarked ? 'Đã lưu' : 'Lưu'}
          >
            <Bookmark size={16} strokeWidth={1.5} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-ink-lighter hover:text-ink transition-colors"
            title="Chia sẻ"
          >
            <Share2 size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setIsMaximized(true)}
            className="p-2 text-ink-lighter hover:text-ink transition-colors"
            title="Toàn màn hình"
          >
            <Maximize2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Thông tin tài liệu */}
      <section className="mb-16 max-w-content">
        <p className="label-red mb-3">CHI TIẾT</p>
        <h2 className="section-heading mb-8">Thông tin tài liệu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-16">
          <InfoRow label="Môn học" value={document.subject_name || 'Đang cập nhật'} />
          <InfoRow label="Khoa" value={document.majors?.name || 'Đa khoa'} />
          <InfoRow label="Học kỳ" value={document.academic_year ? `Năm ${document.academic_year}` : 'Đang cập nhật'} />
          <InfoRow label="Loại tài liệu" value={
            <Badge variant={documentTypeVariants[document.document_type]}>{documentTypeLabels[document.document_type] || 'Khác'}</Badge>
          } />
          <InfoRow label="Dung lượng" value={fileSize} />
          <InfoRow label="Ngày đăng" value={new Date(document.created_at).toLocaleDateString('vi-VN')} />
          <InfoRow label="Lượt xem" value={`${viewCount.toLocaleString('vi-VN')}`} />
          <InfoRow label="Lượt tải" value={`${downloadCount.toLocaleString('vi-VN')}`} />
          <InfoRow label="Trạng thái" value={
            document.status === 'APPROVED'
              ? <span className="inline-flex items-center gap-1 text-ink"><Verified size={13} strokeWidth={1.5} /> Đã xác minh</span>
              : 'Chờ xác minh'
          } />
        </div>
      </section>

      {/* Mô tả */}
      {document.description && (
        <section className="mb-16 max-w-content">
          <p className="label-red mb-3">MÔ TẢ</p>
          <div className="text-body-sm text-ink leading-relaxed whitespace-pre-line">
            {document.description}
          </div>
        </section>
      )}



      {/* Tài liệu liên quan */}
      <section className="mb-16 max-w-content">
        <p className="label-red mb-3">LIÊN QUAN</p>
        <h2 className="section-heading mb-8">Tài liệu liên quan</h2>
        {relatedDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedDocuments.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="group border border-ink p-5 hover:border-red transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge variant={documentTypeVariants[doc.document_type]}>
                    {documentTypeLabels[doc.document_type]}
                  </Badge>
                  {doc.status === 'APPROVED' && (
                    <Verified size={13} strokeWidth={1.5} className="text-ink shrink-0 mt-0.5" />
                  )}
                </div>
                <h3 className="font-serif text-heading-4 font-bold text-ink leading-snug group-hover:text-red transition-colors mb-3">
                  {doc.title}
                </h3>
                <p className="text-body-sm text-ink-lighter mb-3">
                  {doc.majors?.name || 'Đa khoa'} • {doc.subject_name || 'Chung'}
                </p>
                <div className="flex items-center gap-3 font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter pt-3 border-t border-ink/20">
                  <span>{doc.mime_type?.includes('pdf') ? 'PDF' : 'DOC'} • {((doc.file_size || 0) / (1024 * 1024)).toFixed(1)} MB</span>
                  <span className="flex items-center gap-1"><Download size={11} strokeWidth={1.5} />{doc.download_count || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-ink-lighter">Không có tài liệu liên quan.</p>
        )}
      </section>

      {/* Đánh giá */}
      <section className="mb-16 max-w-content">
        <p className="label-red mb-3">ĐÁNH GIÁ</p>
        <h2 className="section-heading mb-2">Đánh giá tài liệu</h2>
        <p className="text-body-sm text-ink-lighter mb-6">Chia sẻ trải nghiệm của bạn về tài liệu này.</p>
        <div className="flex items-center gap-4 mb-6">
          <StarRating value={feedbackRating} onChange={setFeedbackRating} size={24} />
          {feedbackRating > 0 && (
            <span className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">
              {feedbackRating === 1 ? 'Rất tệ' : feedbackRating === 2 ? 'Tệ' : feedbackRating === 3 ? 'Tạm ổn' : feedbackRating === 4 ? 'Tốt' : 'Xuất sắc'}
            </span>
          )}
        </div>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          className="input-field min-h-[100px] mb-4"
          placeholder="Viết nhận xét... (không bắt buộc)"
        />
        <button
          onClick={handleSubmitFeedback}
          disabled={submittingFeedback || !feedbackRating}
          className="btn-primary disabled:opacity-50"
        >
          {submittingFeedback ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </section>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isMaximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/95 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/20">
              <div className="flex items-center gap-3">
                <FileText size={16} strokeWidth={1.5} className="text-paper/60" />
                <h3 className="text-paper font-serif font-bold text-sm truncate max-w-md">{document.title}</h3>
              </div>
              <button onClick={() => setIsMaximized(false)} className="text-paper/60 hover:text-paper"><X size={20} strokeWidth={1.5} /></button>
            </div>
            <div className="flex-1 bg-paper">
              <iframe src={previewUrl} className="w-full h-full border-none" title={document.title} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
