import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Subject } from '@/types/database';
import { BookText, GraduationCap, ChevronRight } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const totalHours = subject.theory_hours + subject.practice_hours + subject.exercise_hours + subject.seminar_hours;

  return (
    <Link href={`/subjects/${subject.id}`}>
      <article className="card p-6 h-full flex flex-col group">
        <div className="flex-1">
          <p className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter mb-2">{subject.code}</p>
          <h3 className="font-serif text-heading-4 font-bold text-ink mb-4 line-clamp-2 transition-colors duration-200 group-hover:text-red">
            {subject.name}
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-meta uppercase tracking-[0.1em] text-ink-lighter">
            <span className="flex items-center gap-2">
              <BookText size={14} strokeWidth={1.5} />
              {subject.credits} tín chỉ
            </span>
            <span className="flex items-center gap-2">
              <GraduationCap size={14} strokeWidth={1.5} />
              {totalHours} tiết
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 mt-5 border-t border-ink/20">
          <span className="font-mono text-meta uppercase tracking-[0.15em] text-ink-lighter transition-colors duration-200 group-hover:text-ink">
            Xem chi tiết
          </span>
          <ChevronRight size={16} strokeWidth={1.5} className="text-ink-lighter transition-colors duration-200 group-hover:text-ink" />
        </div>
      </article>
    </Link>
  );
}
