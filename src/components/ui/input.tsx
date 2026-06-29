import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'w-full border border-border bg-transparent px-4 py-3 text-body-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none transition-colors',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-caption text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export { Input };
