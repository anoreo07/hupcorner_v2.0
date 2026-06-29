import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center border border-ink/20 text-ink-lighter transition-colors duration-200 hover:border-ink hover:text-ink disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Trang trước"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'w-10 h-10 flex items-center justify-center font-mono text-sm transition-colors duration-200',
            page === currentPage
              ? 'bg-ink text-paper'
              : 'border border-ink/20 text-ink-lighter hover:border-ink hover:text-ink'
          )}
          aria-label={`Trang ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center border border-ink/20 text-ink-lighter transition-colors duration-200 hover:border-ink hover:text-ink disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Trang sau"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
}
