import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'meta';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' && 'btn-primary',
          variant === 'outline' && 'btn-outline',
          variant === 'ghost' && 'btn-ghost',
          variant === 'meta' && 'btn-meta',
          size === 'sm' && 'px-4 py-2 text-body-sm',
          size === 'md' && 'px-6 py-3 text-body-sm font-medium uppercase tracking-[0.08em]',
          size === 'lg' && 'px-8 py-4 text-body-sm font-medium uppercase tracking-[0.08em]',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
export { Button, type ButtonProps };
