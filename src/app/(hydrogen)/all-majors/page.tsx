import { Suspense } from 'react';
import AllMajorsContent from './all-majors-content';

export const dynamic = 'force-dynamic';

export default function AllMajorsPage() {
  return (
    <Suspense fallback={
      <div className="editorial-container py-6 md:py-10">
        <div className="mb-12">
          <div className="h-8 w-48 bg-ink/5 animate-pulse mb-2" />
          <div className="h-5 w-72 bg-ink/5 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border border-border-light p-6 h-72 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <AllMajorsContent />
    </Suspense>
  );
}
