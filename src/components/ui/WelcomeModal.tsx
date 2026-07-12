'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'hup_corner_welcome_shown';

export function WelcomeModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const handleFeedback = useCallback(() => {
    router.push('/feedback');
    handleClose();
  }, [router, handleClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    },
    [handleClose],
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

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    dialog.addEventListener('keydown', trap);
    return () => dialog.removeEventListener('keydown', trap);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="welcome-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="HUP Corner xin chào"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative bg-paper border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row rounded-[12px]"
          >
            <button
              onClick={handleClose}
              aria-label="Đóng"
              className="absolute top-3 right-3 z-10 p-1.5 text-ink-lighter hover:text-ink transition-colors bg-paper/80"
            >
              <X size={20} />
            </button>

            <div className="relative w-full md:w-1/2 h-48 md:h-auto shrink-0">
              <Image
                src="/introduce.png"
                alt="HUP Corner introduction"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="flex flex-col justify-center w-full md:w-1/2 p-6 md:p-8 lg:p-10 overflow-y-auto">
              <h2 className="font-serif text-heading-4 md:text-heading-3 font-bold text-ink tracking-tight mb-4">
                HUP Corner xin chào
              </h2>
              <p className="text-body text-ink-light leading-relaxed mb-6 md:mb-8">
                HUP Corner được phát triển với mong muốn lưu trữ và chia sẻ tài liệu cho cộng đồng sinh viên Trường Đại học Dược Hà Nội, giúp các bạn dễ dàng hơn trong việc tiếp cận và tìm kiếm tài liệu học tập.
                <br />
                <br />
                Hiện tại, HUP Corner vẫn đang trong giai đoạn phát triển và hoàn thiện. Chúng mình rất mong nhận được ý kiến đóng góp từ các bạn sinh viên để HUP Corner ngày càng hữu ích hơn. Cảm ơn bạn đã ghé thăm!
              </p>
              <div className="flex items-center gap-3 mt-auto justify-end">
                <Button variant="outline" onClick={handleClose}>
                  Đóng
                </Button>
                <Button variant="primary" onClick={handleFeedback}>
                  Góp ý cho HUP Corner
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
