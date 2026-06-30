'use client';

import { useState } from 'react';
import { Subject } from '@/types/database';
import { SubjectCard } from '@/components/editorial/subject-card';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, BookOpen } from 'lucide-react';

export default function SubjectsList({ initialSubjects }: { initialSubjects: Subject[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredSubjects = initialSubjects.filter(
    (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const currentItems = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="arionear-container py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="label-red mb-3">HỆ THỐNG MÔN HỌC</p>
          <h1 className="page-heading">Môn học</h1>
          <p className="subheading max-w-xl mt-2">
            Tra cứu các môn học theo chương trình đào tạo. Mỗi môn học bao gồm tài liệu,
            đề cương và bài ôn thi.
          </p>
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-lighter" size={16} strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="input-field pl-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentItems.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
        {filteredSubjects.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={<BookOpen size={48} strokeWidth={1.5} />}
              title="Không tìm thấy môn học"
              description="Thử tìm kiếm với từ khoá khác."
            />
          </div>
        )}
      </div>

      <div className="mt-16">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
