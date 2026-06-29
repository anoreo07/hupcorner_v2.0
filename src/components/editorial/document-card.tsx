'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { DocumentWithMajor, DocumentType } from '@/types/database';
import { Eye, Download, ArrowRight, BookOpen, FileText, ScrollText, FilePlus, HelpCircle } from 'lucide-react';

export const documentTypeVariants: Record<DocumentType, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  EXAM: 'danger',
  SLIDE: 'info',
  TEXTBOOK: 'success',
  OUTLINE: 'warning',
  OTHER: 'default',
};

export const documentTypeLabels: Record<DocumentType, string> = {
  EXAM: 'Đề thi',
  SLIDE: 'Bài giảng',
  TEXTBOOK: 'Giáo trình',
  OUTLINE: 'Đề cương',
  OTHER: 'Khác',
};

const typeIcons: Record<DocumentType, React.ReactNode> = {
  TEXTBOOK: <BookOpen size={16} strokeWidth={1.5} />,
  SLIDE: <FileText size={16} strokeWidth={1.5} />,
  EXAM: <ScrollText size={16} strokeWidth={1.5} />,
  OUTLINE: <FilePlus size={16} strokeWidth={1.5} />,
  OTHER: <HelpCircle size={16} strokeWidth={1.5} />,
};

interface DocumentCardProps {
  doc: DocumentWithMajor;
  index?: number;
}

export function DocumentCard({ doc, index }: DocumentCardProps) {
  return (
    <article className="card card-shadow p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-ink-lighter shrink-0">
            {typeIcons[doc.document_type] || typeIcons.OTHER}
          </span>
          {typeof index === 'number' && (
            <span className="card-number">SỐ {String(index + 1).padStart(2, '0')}</span>
          )}
        </div>
      </div>

      <Link href={`/documents/${doc.id}`}>
        <h3 className="font-serif font-bold text-ink text-heading-4 leading-snug mb-3 transition-colors duration-200 hover:text-red">
          {doc.title}
        </h3>
      </Link>

      <p className="text-body-sm text-ink-lighter mb-6">{doc.majors?.name || 'Đa khoa'}</p>

      <div className="flex items-center justify-between pt-4 border-t border-ink/20">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter">
            {doc.mime_type?.includes('pdf') ? 'PDF' : 'DOC'} &bull; {((doc.file_size || 0) / (1024 * 1024)).toFixed(1)} MB
          </span>
          <div className="flex items-center gap-3 font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter">
            <span className="flex items-center gap-1"><Eye size={11} strokeWidth={1.5} />{doc.view_count || 0}</span>
            <span className="flex items-center gap-1"><Download size={11} strokeWidth={1.5} />{doc.download_count || 0}</span>
          </div>
        </div>

        <Link
          href={`/documents/${doc.id}`}
          className="inline-flex items-center gap-1.5 font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter transition-colors duration-200 hover:text-ink"
        >
          Xem <ArrowRight size={12} strokeWidth={1.5} />
        </Link>
      </div>
    </article>
  );
}
