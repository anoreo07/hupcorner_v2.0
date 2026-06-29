import { cn } from '@/lib/utils';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-light', className)}>
      <div className="text-ink-lighter/40 mb-4">
        {icon || <FileX size={48} />}
      </div>
      <h3 className="font-serif text-heading-4 font-bold text-ink mb-1">{title}</h3>
      {description && <p className="text-body-sm text-ink-lighter max-w-xs mx-auto mb-6">{description}</p>}
      {action}
    </div>
  );
}
