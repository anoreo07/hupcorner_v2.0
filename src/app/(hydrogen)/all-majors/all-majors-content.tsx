'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentWithMajor } from '@/types/database';
import { getApprovedDocumentsPaginated, getOtherDocumentsPaginated } from '@/lib/supabase';
import { DocumentCard } from '@/components/editorial/document-card';
import { FilterBar } from '@/components/navigation/filter-bar';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, BookOpen, FlaskConical, Stethoscope, Dna, MoreHorizontal, Search } from 'lucide-react';
import Link from 'next/link';

const majorFilters = [
  { name: 'Tất cả', code: 'ALL', icon: <BookOpen size={16} strokeWidth={1.5} /> },
  { name: 'Dược học', code: 'DUOC_HOC', icon: <Stethoscope size={16} strokeWidth={1.5} /> },
  { name: 'Hóa dược', code: 'HOA_DUOC', icon: <FlaskConical size={16} strokeWidth={1.5} /> },
  { name: 'CNSH', code: 'CONG_NGHE_SINH_HOC', icon: <Dna size={16} strokeWidth={1.5} /> },
  { name: 'Hóa học', code: 'HOA_HOC', icon: <FlaskConical size={16} strokeWidth={1.5} /> },
  { name: 'Khác', code: 'OTHER', icon: <MoreHorizontal size={16} strokeWidth={1.5} /> },
];

export default function AllMajorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMajor = searchParams.get('major') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [activeMajor, setActiveMajor] = useState(initialMajor);
  const [searchText, setSearchText] = useState(initialSearch);
  const [documents, setDocuments] = useState<DocumentWithMajor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 9;

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      if (activeMajor === 'OTHER') {
        result = await getOtherDocumentsPaginated(page, perPage);
      } else {
        const majorCode = activeMajor === 'ALL' ? undefined : activeMajor;
        result = await getApprovedDocumentsPaginated(majorCode, page, perPage);
      }

      let filteredData = result.data;
      if (searchText) {
        filteredData = filteredData.filter(doc =>
          doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
          doc.subject_name?.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setDocuments(filteredData);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [activeMajor, page, searchText]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleMajorChange = (code: string) => {
    setActiveMajor(code);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (code === 'ALL') params.delete('major');
    else params.set('major', code);
    router.push(`/all-majors?${params.toString()}`);
  };

  return (
    <div className="arionear-container py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="label-red mb-3">TRA CỨU TÀI LIỆU</p>
          <h1 className="page-heading">
            {majorFilters.find(m => m.code === activeMajor)?.name || 'Tất cả'}
          </h1>
        </div>
        <div className="relative max-w-md w-full md:w-72 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-lighter" size={16} strokeWidth={1.5} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm tài liệu, môn học..."
            className="input-field pl-11"
          />
        </div>
      </div>

      <FilterBar
        filters={majorFilters}
        activeFilter={activeMajor}
        onFilterChange={handleMajorChange}
      />

      <section className="mt-10 min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-30">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="border border-ink/10 p-6 h-72 animate-pulse" />
            ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, i) => (
              <DocumentCard key={doc.id} doc={doc} index={i} />
            ))}
            <Link href="#" className="border-2 border-dashed border-ink/20 p-8 flex flex-col items-center justify-center text-center gap-4 transition-colors duration-200 hover:border-ink group">
              <FileText size={32} strokeWidth={1.5} className="text-ink-lighter/40 transition-colors duration-200 group-hover:text-ink-lighter" />
              <div>
                <h3 className="font-serif text-heading-4 font-bold text-ink">Có tài liệu muốn chia sẻ?</h3>
                <p className="text-body-sm text-ink-lighter mt-1">Đóng góp vào kho tàng tri thức.</p>
              </div>
              <span className="btn-meta">Tải lên</span>
            </Link>
          </div>
        ) : (
          <EmptyState
            icon={<FileText size={48} strokeWidth={1.5} />}
            title="Không tìm thấy tài liệu"
            description="Thử thay đổi từ khoá hoặc bộ lọc."
            action={
              <button
                onClick={() => { setSearchText(''); setActiveMajor('ALL'); }}
                className="btn-outline"
              >
                Xoá bộ lọc
              </button>
            }
          />
        )}
      </section>

      {totalPages > 1 && (
        <div className="mt-16">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
