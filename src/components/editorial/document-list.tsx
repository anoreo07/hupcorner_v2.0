'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { DocumentWithMajor } from '@/types/database';
import { DocumentCard } from './document-card';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText } from 'lucide-react';

interface DocumentListProps {
  documents: DocumentWithMajor[];
  perPage?: number;
}

export function DocumentList({ documents, perPage = 12 }: DocumentListProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(documents.length / perPage));
  const paginated = documents.slice((page - 1) * perPage, page * perPage);

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={48} />}
        title="Chưa có tài liệu"
        description="Chưa có tài liệu nào trong danh mục này."
      />
    );
  }

  return (
    <div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {paginated.map((doc) => (
          <motion.div
            key={doc.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
            }}
          >
            <DocumentCard key={doc.id} doc={doc} />
          </motion.div>
        ))}
      </motion.div>
      <div className="mt-12">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
