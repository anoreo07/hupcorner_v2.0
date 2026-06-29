import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="font-mono text-meta uppercase tracking-widest text-ink-lighter block">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={cn(
              'w-full border border-border bg-transparent px-4 py-3 text-body-sm text-ink focus:border-ink focus:outline-none transition-colors appearance-none',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-ink-lighter" size={16} />
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
export { Select };
