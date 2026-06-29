'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/all-majors?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-ink-lighter hover:text-ink transition-colors"
          aria-label="Tìm kiếm"
        >
          <Search size={20} />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="w-48 md:w-64 border border-border bg-transparent px-4 py-2 text-body-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => { setIsOpen(false); setQuery(''); }}
            className="text-ink-lighter hover:text-ink"
          >
            <X size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
