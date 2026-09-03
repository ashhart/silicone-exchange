"use client";

import { useCompare, COMPARE_LIMIT } from "@/stores/compare";

/** Checkbox-style toggle that adds/removes a listing from the compare tray. */
export function CompareToggle({ id }: { id: string }) {
  const ids = useCompare((s) => s.ids);
  const toggle = useCompare((s) => s.toggle);
  const checked = ids.includes(id);
  const disabled = !checked && ids.length >= COMPARE_LIMIT;

  return (
    <label
      className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-colors ${
        checked
          ? "border-accent bg-accent-soft text-accent"
          : disabled
            ? "cursor-not-allowed border-line text-faint"
            : "border-line text-muted hover:border-line-strong hover:text-ink"
      }`}
      title={disabled ? `Compare is limited to ${COMPARE_LIMIT} listings` : undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => toggle(id)}
        className="sr-only"
      />
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        {checked ? (
          <path d="M2 6.5 4.5 9 10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        )}
      </svg>
      Compare
    </label>
  );
}
