export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line2 bg-surface px-6 py-16 text-center">
      <svg
        viewBox="0 0 24 24"
        className="h-8 w-8 text-faint"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <path d="M9 5V3M15 5V3M9 21v-2M15 21v-2M5 9H3M5 15H3M21 9h-2M21 15h-2" />
      </svg>
      <div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}
