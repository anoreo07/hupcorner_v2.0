export function AnimatedLogo() {
  return (
    <div className="flex items-baseline gap-1.5 md:gap-2 font-serif">
      <span className="text-2xl md:text-3xl font-bold text-[#2b2622] leading-none tracking-tight">HUP</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 34 34"
        className="md:w-[22px] md:h-[22px] animate-spin"
        style={{ animationDuration: '6s' }}
      >
        <circle cx="17" cy="17" r="16" fill="none" stroke="#B5453B" strokeWidth="1.5" />
        <g transform="translate(17,17) rotate(-45)">
          <rect x="-11" y="-5" width="22" height="10" rx="5" fill="none" stroke="#B5453B" strokeWidth="1.6" />
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#B5453B" strokeWidth="1.6" />
          <rect x="-11" y="-5" width="11" height="10" rx="5" fill="#B5453B" opacity="0.85" />
        </g>
      </svg>
      <span className="text-2xl md:text-3xl font-bold text-[#B5453B] leading-none tracking-tight">Corner</span>
    </div>
  );
}
