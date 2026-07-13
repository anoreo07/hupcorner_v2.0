'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface UploadGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadGuideModal({ isOpen, onClose }: UploadGuideModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="upload-guide-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-paper border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[12px]"
          >
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="absolute top-3 right-3 z-10 p-1.5 text-ink-lighter hover:text-ink transition-colors bg-paper/80"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-[200px] h-[200px] md:h-auto shrink-0">
                <Image
                  src="/character.png"
                  alt="Hướng dẫn upload"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>

              <div className="flex flex-col justify-center p-6 md:p-8 lg:p-10 overflow-y-auto">
                <h2 className="font-serif text-heading-4 md:text-heading-3 font-bold text-ink tracking-tight mb-4">
                  Hướng dẫn upload file
                </h2>
                <div className="space-y-3 text-body-sm text-ink-light leading-relaxed">
                  <p>
                    <strong className="text-ink">Upload một file:</strong> Chọn 1 file bất kỳ (PDF, ảnh, tài liệu văn phòng...). File sẽ được hiển thị trực tiếp trên web như bình thường.
                  </p>
                  <p>
                    <strong className="text-ink">Upload nhiều file ảnh:</strong> Chọn nhiều file ảnh (.jpg, .jpeg, .png, .webp, .gif). Hệ thống sẽ tự động gộp chúng vào một file PDF để bạn có thể xem trực tiếp trên web.
                  </p>
                  <p>
                    <strong className="text-ink">Upload nhiều file khác:</strong> Chọn nhiều file với các định dạng khác nhau (PDF, PPTX, DOCX,...). Hệ thống sẽ tự động nén chúng thành file ZIP. Khi xem chi tiết, bạn sẽ được nhắc tải về để xem nội dung.
                  </p>
                </div>
                <div className="flex justify-end mt-6">
                  <Button variant="primary" onClick={onClose}>
                    Đã hiểu
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
