export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Silicon Exchange logo"
      fill="none"
    >
      <rect x="9" y="9" width="14" height="14" rx="2" className="fill-accent/15 stroke-accent" strokeWidth="1.5" />
      <path
        d="M13 9V5M19 9V5M13 27v-4M19 27v-4M9 13H5M9 19H5M27 13h-4M27 19h-4"
        className="stroke-accent"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 16l-3.5-3.5M16 16l3.5 3.5M16 16l3.5-3.5M16 16l-3.5 3.5"
        className="stroke-ink"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="1.5" className="fill-accent" />
    </svg>
  );
}
