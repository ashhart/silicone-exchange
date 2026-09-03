import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cx("h-5 w-5", className)}
      fill="none"
    >
      <rect x="2.5" y="2.5" width="19" height="19" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="6" width="5" height="5" fill="currentColor" opacity="0.55" />
      <rect x="13" y="6" width="5" height="5" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="13" width="5" height="5" stroke="currentColor" strokeWidth="1" />
      <rect x="13" y="13" width="5" height="5" fill="currentColor" />
    </svg>
  );
}

export type BadgeTone = "good" | "warn" | "bad" | "accent" | "faint";

const TONE_CLASS: Record<BadgeTone, string> = {
  good: "text-good border-good/40",
  warn: "text-warn border-warn/40",
  bad: "text-bad border-bad/40",
  accent: "text-accent border-accent/40",
  faint: "text-faint border-hairline",
};

export function Badge({
  tone,
  children,
  dot = true,
}: {
  tone: BadgeTone;
  children: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-[10px] tracking-widest uppercase",
        TONE_CLASS[tone],
      )}
    >
      {dot ? (
        <span aria-hidden="true" className="h-1 w-1 bg-current" />
      ) : null}
      {children}
    </span>
  );
}

const LISTING_TONE = {
  available: { tone: "good", label: "online" },
  maintenance: { tone: "warn", label: "maint" },
  retired: { tone: "faint", label: "retired" },
} as const;

export function ListingStatusBadge({
  status,
}: {
  status: keyof typeof LISTING_TONE;
}) {
  const { tone, label } = LISTING_TONE[status];
  return <Badge tone={tone}>{label}</Badge>;
}

const RES_TONE = {
  confirmed: { tone: "accent", label: "confirmed" },
  held: { tone: "warn", label: "held" },
  cancelled: { tone: "faint", label: "cancelled" },
  expired: { tone: "bad", label: "expired" },
} as const;

export function ReservationStatusBadge({
  status,
}: {
  status: keyof typeof RES_TONE;
}) {
  const { tone, label } = RES_TONE[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-[10px] tracking-widest text-faint uppercase">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-semibold text-ink tabular-nums md:text-4xl">
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-dim">{sub}</div> : null}
    </div>
  );
}

/** Small labelled key/value row for spec sheets and breakdowns. */
export function SpecRow({
  k,
  v,
  accent = false,
}: {
  k: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline py-2 last:border-b-0">
      <dt className="text-[11px] tracking-widest text-faint uppercase">{k}</dt>
      <dd
        className={cx(
          "text-right text-sm tabular-nums",
          accent ? "text-accent" : "text-ink",
        )}
      >
        {v}
      </dd>
    </div>
  );
}
