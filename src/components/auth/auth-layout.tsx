'use client';

import { AnimatedLogo } from '@/components/layout/animated-logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  headingLine1: string;
  headingLine2: string;
  highlightText: string;
  description: string;
  badgeText: string;
  accentColor?: 'yellow' | 'blue' | 'green' | 'red';
}

const accentMap = {
  yellow: { bg: '#FDF2C1', border: '#111111' },
  blue: { bg: '#C1D9FD', border: '#111111' },
  green: { bg: '#C1FDC1', border: '#111111' },
  red: { bg: '#FDC1C1', border: '#111111' },
};

export function AuthLayout({
  children,
  headingLine1,
  headingLine2,
  highlightText,
  description,
  badgeText,
  accentColor = 'yellow',
}: AuthLayoutProps) {
  const accent = accentMap[accentColor];

  return (
    <div className="h-screen flex flex-col md:flex-row bg-paper relative overflow-hidden">
      {/* Decorative circles */}
      <div className="hidden md:block absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-blue-200/60 border-2 border-ink" />
      <div className="hidden md:block absolute bottom-[-60px] left-[20%] w-48 h-48 rounded-full bg-green-200/60 border-2 border-ink" />
      <div className="hidden md:block absolute top-[30%] right-[48%] w-72 h-72 rounded-full bg-yellow-200/40 border-2 border-ink" />
      <div className="hidden md:block absolute bottom-[10%] right-[10%] w-32 h-32 rounded-full bg-red-200/40 border-2 border-ink" />

      {/* Left column — Hero */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 lg:p-24 h-[50vh] md:h-full">
        {/* Top bar */}
        <div className="flex items-start justify-between">
          <a
            href="/home"
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-ink bg-paper text-meta font-mono uppercase tracking-widest font-medium shadow-[4px_4px_0px_0px_#111] hover:shadow-[2px_2px_0px_0px_#111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            ← Trang chủ
          </a>
          <span className="hidden md:block rotate-[6deg]">
            <div className="px-3 py-2 bg-red border-2 border-ink shadow-[4px_4px_0px_0px_#111] font-serif font-bold text-paper text-sm uppercase tracking-wide">
              {badgeText}
            </div>
          </span>
        </div>

        {/* Mascot + Speech bubble */}
        <div className="flex items-end gap-4 mb-6">
          <PharmacistMascot />
          <div className="rotate-[-4deg] px-4 py-2 bg-paper border-2 border-ink shadow-[4px_4px_0px_0px_#111] font-mono text-meta uppercase tracking-widest font-bold">
            HỌC LÀ NGHIỀN!
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="font-serif text-[3rem] md:text-[4.5rem] font-bold leading-[0.9] tracking-tight text-ink">
            {headingLine1}<br />
            {headingLine2}
          </h1>
          <div
            className="inline-block px-4 py-2 border-2 border-ink font-serif font-bold text-xl md:text-2xl tracking-tight"
            style={{ backgroundColor: accent.bg, borderColor: accent.border }}
          >
            {highlightText}
          </div>
          <p className="font-sans text-body md:text-body text-ink-lighter leading-relaxed max-w-md mt-4">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="font-mono text-meta uppercase tracking-widest text-ink-lighter mt-8">
          &copy; {new Date().getFullYear()} HUP Corner
        </div>
      </div>

      {/* Right column — Form */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 h-1/2 md:h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="border-2 border-ink bg-paper shadow-[8px_8px_0px_0px_#111] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-3 py-1 border-2 border-ink font-mono text-meta uppercase tracking-widest font-bold"
                style={{ backgroundColor: accent.bg }}
              >
                {badgeText}
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PharmacistMascot() {
  return (
    <svg width="100" height="120" viewBox="0 0 100 120" className="shrink-0">
      {/* Body - white coat */}
      <rect x="30" y="55" width="40" height="40" rx="4" fill="#F7F5F1" stroke="#111" strokeWidth="2" />
      {/* Lab coat collar */}
      <path d="M38 55 L45 65 L50 55 L55 65 L62 55" fill="none" stroke="#111" strokeWidth="2" />
      {/* Head */}
      <circle cx="50" cy="35" r="20" fill="#FFE0C8" stroke="#111" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="42" cy="32" r="3" fill="#111" />
      <circle cx="58" cy="32" r="3" fill="#111" />
      {/* Smile */}
      <path d="M42 40 Q50 46 58 40" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
      {/* Hair */}
      <path d="M30 30 Q35 15 50 18 Q65 15 70 30" fill="#111" />
      {/* Medical cross on forehead */}
      <rect x="47" y="22" width="6" height="12" rx="1" fill="#D43B2C" />
      <rect x="44" y="25" width="12" height="6" rx="1" fill="#D43B2C" />
      {/* Stethoscope */}
      <path d="M56 48 Q62 52 60 60 Q58 68 50 68" fill="none" stroke="#777" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="69" r="5" fill="none" stroke="#777" strokeWidth="2" />
      {/* Left arm waving */}
      <path d="M30 65 L12 50 Q8 46 12 42" fill="none" stroke="#F7F5F1" strokeWidth="8" strokeLinecap="round" />
      <path d="M30 65 L12 50 Q8 46 12 42" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
      {/* Right arm */}
      <path d="M70 65 L82 55" fill="none" stroke="#F7F5F1" strokeWidth="8" strokeLinecap="round" />
      <path d="M70 65 L82 55" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
      {/* Clipboard */}
      <rect x="76" y="48" width="14" height="18" rx="2" fill="#C1D9FD" stroke="#111" strokeWidth="1.5" />
      <line x1="79" y1="54" x2="87" y2="54" stroke="#111" strokeWidth="1" />
      <line x1="79" y1="58" x2="87" y2="58" stroke="#111" strokeWidth="1" />
      {/* Legs */}
      <rect x="34" y="92" width="10" height="20" rx="3" fill="#2b2622" />
      <rect x="56" y="92" width="10" height="20" rx="3" fill="#2b2622" />
      {/* Shoes */}
      <ellipse cx="39" cy="114" rx="10" ry="5" fill="#111" />
      <ellipse cx="61" cy="114" rx="10" ry="5" fill="#111" />
    </svg>
  );
}
