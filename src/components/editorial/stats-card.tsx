import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: number | string;
  className?: string;
}

export function StatsCard({ label, value, className }: StatsCardProps) {
  return (
    <div className={cn('border border-border-light p-6', className)}>
      <p className="stat-label mb-1">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
