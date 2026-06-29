import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge',
        variant === 'default' && 'border-ink/20 text-ink-lighter',
        variant === 'success' && 'border-ink text-ink',
        variant === 'warning' && 'border-ink text-ink-light',
        variant === 'danger' && 'badge-red',
        variant === 'info' && 'border-ink text-ink-lighter',
        className
      )}
    >
      {children}
    </span>
  );
}
