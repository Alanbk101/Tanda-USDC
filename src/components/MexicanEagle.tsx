// Mexican Eagle Emblem component
export function MexicanEagle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="36" rx="12" ry="14" className="fill-mexican-green" />
      <circle cx="32" cy="20" r="8" className="fill-mexican-green" />
      <path d="M32 24 L36 28 L32 32 L28 28 Z" className="fill-gold" />
      <circle cx="30" cy="18" r="1.5" className="fill-foreground" />
      <circle cx="34" cy="18" r="1.5" className="fill-foreground" />
      <path d="M20 30 Q8 25 4 35 Q10 40 20 38 Z" className="fill-mexican-green" />
      <path d="M18 32 Q10 28 6 34" stroke="currentColor" strokeWidth="1" className="stroke-gold" fill="none" />
      <path d="M16 34 Q10 31 7 36" stroke="currentColor" strokeWidth="1" className="stroke-gold" fill="none" />
      <path d="M44 30 Q56 25 60 35 Q54 40 44 38 Z" className="fill-mexican-green" />
      <path d="M46 32 Q54 28 58 34" stroke="currentColor" strokeWidth="1" className="stroke-gold" fill="none" />
      <path d="M48 34 Q54 31 57 36" stroke="currentColor" strokeWidth="1" className="stroke-gold" fill="none" />
      <path d="M26 48 L22 58 L26 54 L30 60 L32 52 L34 60 L38 54 L42 58 L38 48 Z" className="fill-mexican-red" />
      <path d="M24 36 Q28 42 32 38 Q36 34 40 40" stroke="currentColor" strokeWidth="2" className="stroke-mexican-red" fill="none" strokeLinecap="round" />
      <ellipse cx="32" cy="50" rx="6" ry="3" className="fill-mexican-green opacity-70" />
      <path d="M28 12 L30 8 L32 12 L34 8 L36 12" stroke="currentColor" strokeWidth="1.5" className="stroke-gold" fill="none" strokeLinecap="round" />
    </svg>
  );
}
