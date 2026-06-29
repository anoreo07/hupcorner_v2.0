'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({ value, onChange, readonly = false, size = 20 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label="Đánh giá">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange?.(star); } }}
            className={cn(
              'transition-all duration-200',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              filled ? 'text-ink' : 'text-ink/20',
            )}
            role="radio"
            aria-checked={star <= value}
            aria-label={`${star} sao`}
          >
            <Star size={size} fill={filled ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}
