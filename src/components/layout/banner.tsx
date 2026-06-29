'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '@/types/database';
import { Megaphone, X } from 'lucide-react';

interface BannerProps {
  notifications: Notification[];
}

export function Banner({ notifications }: BannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const dismissed = localStorage.getItem(`dismissed_announcement_${notifications[0].id}`);
      if (!dismissed) setIsVisible(true);
    }
  }, [notifications]);

  if (!notifications || notifications.length === 0 || !isVisible) return null;

  const current = notifications[0];

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`dismissed_announcement_${current.id}`, 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="editorial-container"
      >
        <div className="border border-border-light bg-paper-light p-4 flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Megaphone size={18} className="text-ink-lighter shrink-0" />
            <div className="min-w-0">
              <p className="font-mono text-meta uppercase tracking-widest text-ink-lighter mb-0.5">Thông báo</p>
              <p className="text-body-sm text-ink font-medium truncate">{current.title}{current.description ? ` — ${current.description}` : ''}</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-ink-lighter hover:text-ink shrink-0">
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
