"use client";

import { MAX_COMPARE, useCompare } from "@/store/useCompare";

export function CompareToggle({ listingId }: { listingId: string }) {
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const selected = ids.includes(listingId);
  const full = ids.length >= MAX_COMPARE && !selected;

  return (
    <button
      type="button"
      onClick={() => toggle(listingId)}
      aria-pressed={selected}
      aria-label={
        selected ? `Remove ${listingId} from compare` : `Add ${listingId} to compare`
      }
      title={full ? `Compare is full (${MAX_COMPARE} max)` : undefined}
      disabled={full}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-line bg-surface text-muted hover:border-line2 hover:text-ink"
      }`}
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M2 4h12M2 8h12M2 12h7" />
      </svg>
      {selected ? "In compare" : "Compare"}
    </button>
  );
}
