export function Loading({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20', className)}>
      <div className="w-8 h-8 border-2 border-ink/10 border-t-ink rounded-full animate-spin mb-4" />
      <p className="font-mono text-meta uppercase tracking-widest text-ink-lighter">Đang tải</p>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
