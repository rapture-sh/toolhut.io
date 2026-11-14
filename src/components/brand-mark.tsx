interface BrandMarkProps {
  className?: string;
}

/** A filled tile with the toolhut hash knocked out of it. */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect width="40" height="40" rx="12" className="fill-primary" />
      <g
        stroke="var(--primary-foreground)"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <line x1="17.5" y1="11" x2="14.5" y2="29" />
        <line x1="26" y1="11" x2="23" y2="29" />
        <line x1="10.5" y1="17" x2="30" y2="17" />
        <line x1="9.5" y1="23.5" x2="29" y2="23.5" />
      </g>
    </svg>
  );
}
