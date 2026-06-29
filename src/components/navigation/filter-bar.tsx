'use client';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface FilterBarProps {
  filters: { code: string; name: string; icon?: React.ReactNode }[];
  activeFilter: string;
  onFilterChange: (code: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
}: FilterBarProps) {
  return (
    <div className="space-y-6">
      {onSearchChange && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-lighter" size={16} strokeWidth={1.5} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-field pl-11"
          />
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
        {filters.map((filter) => (
          <button
            key={filter.code}
            onClick={() => onFilterChange(filter.code)}
            className={cn(
              'filter-chip whitespace-nowrap',
              activeFilter === filter.code ? 'filter-chip-active' : 'filter-chip-inactive'
            )}
          >
            {filter.icon}
            {filter.name}
          </button>
        ))}
      </div>
    </div>
  );
}
