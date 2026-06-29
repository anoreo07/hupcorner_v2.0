'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Dialog({ open, onClose, children, title, className }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn('relative bg-paper border border-border shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto', className)}
          >
            {title && (
              <div className="flex items-center justify-between px-8 py-5 border-b border-border-light">
                <h2 className="font-serif text-heading-4 font-bold text-ink">{title}</h2>
                <button onClick={onClose} className="text-ink-lighter hover:text-ink transition-colors">
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="p-8">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
