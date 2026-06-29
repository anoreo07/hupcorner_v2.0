import { cn } from '@/lib/utils';

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter">{label}</span>
      <span className="text-body-sm text-ink font-medium">{value}</span>
    </div>
  );
}
