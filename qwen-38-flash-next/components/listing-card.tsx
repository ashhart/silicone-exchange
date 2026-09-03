"use client";

import Link from "next/link";
import { useCompareStore } from "@/store/compare";
import type { Listing } from "@/lib/types";
import { usd } from "@/lib/format";
import { cx } from "@/lib/cx";
import { ListingStatusBadge } from "./ui";

export function ListingCard({
  listing,
  utilPct,
}: {
  listing: Listing;
  utilPct: number;
}) {
  const inCompare = useCompareStore((s) => s.ids.includes(listing.id));
  const toggle = useCompareStore((s) => s.toggle);
  const full = useCompareStore(
    (s) => !s.ids.includes(listing.id) && s.ids.length >= 3,
  );

  return (
    <article className="group relative flex flex-col border border-hairline bg-panel transition-all duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)]">
      <Link href={`/listings/${listing.slug}`} className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="text-[11px] text-faint tabular-nums">{listing.id}</span>
          <ListingStatusBadge status={listing.status} />
        </div>
        <h3 className="mt-2 font-display text-base leading-snug font-semibold text-ink group-hover:text-accent">
          {listing.name}
        </h3>
        <p className="mt-1 text-[11px] text-dim">
          {listing.chip} · {listing.memoryGb} GB · {listing.region} ·{" "}
          {listing.units} units
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-hairline pt-3">
          <Metric label="TFLOPS" value={listing.tflops.toLocaleString("en-US")} />
          <Metric label="Mem GB" value={String(listing.memoryGb)} />
          <Metric label="Util 24h" value={`${utilPct}%`} />
        </div>

        <div className="mt-3 h-1 w-full bg-hairline" aria-hidden="true">
          <div className="h-full bg-accent/70" style={{ width: `${utilPct}%` }} />
        </div>

        <div className="mt-4">
          <span className="font-display text-2xl font-semibold text-ink tabular-nums">
            {usd(listing.priceCentsPerHour)}
            <span className="font-mono text-[11px] text-faint">/h</span>
          </span>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-hairline px-4 py-2">
        <span className="text-[10px] text-faint tabular-nums">
          uptime {(listing.uptimeBps / 100).toFixed(2)}%
        </span>
        <button
          type="button"
          aria-pressed={inCompare}
          disabled={full}
          title={
            full
              ? "Compare list is full (max 3). Remove one first."
              : inCompare
                ? "Remove from compare"
                : "Add to compare"
          }
          onClick={() => toggle(listing.id)}
          className={cx(
            "border px-1.5 py-0.5 text-[9px] tracking-[0.14em] uppercase transition-colors",
            inCompare
              ? "border-accent bg-accent text-bg"
              : "border-hairline text-faint hover:border-accent hover:text-accent",
            full && "cursor-not-allowed opacity-40",
          )}
        >
          {inCompare ? "compare ✓" : "compare +"}
        </button>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] tracking-widest text-faint uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-ink tabular-nums">{value}</div>
    </div>
  );
}
