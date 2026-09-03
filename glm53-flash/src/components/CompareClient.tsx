"use client";

import type { Listing } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCompare, COMPARE_LIMIT } from "@/stores/compare";
import { LISTING_BY_ID } from "@/data/listings";
import { REGION_BY_CODE } from "@/data/regions";
import { formatCentsPerHour } from "@/lib/money";

const ROWS: Array<{ label: string; render: (l: Listing) => string }> = [
  { label: "Vendor", render: (l) => l.vendor },
  { label: "Chip", render: (l) => l.chip },
  { label: "Region", render: (l) => REGION_BY_CODE[l.region]?.label ?? l.region },
  { label: "Site", render: (l) => l.site },
  { label: "Memory", render: (l) => `${l.memoryGB} GB ${l.memoryType}` },
  { label: "Bandwidth", render: (l) => `${l.bandwidthGBs.toLocaleString("en-US")} GB/s` },
  { label: "Compute", render: (l) => `${l.tflops} TFLOPS` },
  { label: "Precision", render: (l) => l.tflopsPrecision },
  { label: "Interconnect", render: (l) => l.interconnect },
  { label: "Max power", render: (l) => `${l.maxPowerWatts} W` },
  { label: "Hourly rate", render: (l) => formatCentsPerHour(l.hourlyRateCents) },
  { label: "Status", render: (l) => l.status },
];

export function CompareClient() {
  const ids = useCompare((s) => s.ids);
  const hydrated = useCompare((s) => s.hydrated);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);

  const listings = ids.map((id) => LISTING_BY_ID[id]).filter((l) => l !== undefined);

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-[13px] text-faint sm:px-6">Loading selection…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-700 text-ink">Compare units</h1>
          <p className="mt-1 text-[13px] text-muted">
            {listings.length} of {COMPARE_LIMIT} selected · pick units from any listing card or detail page
          </p>
        </div>
        {listings.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="rounded-md border border-line px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-danger hover:text-danger"
          >
            Clear selection
          </button>
        ) : null}
      </header>

      {listings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-lg border border-dashed border-line-strong py-20 text-center">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-faint">
            <rect x="3" y="10" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="23" y="10" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 14v12" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 3" />
          </svg>
          <h2 className="mt-4 font-display text-lg font-600 text-ink">Nothing selected yet</h2>
          <p className="mt-1 max-w-sm text-[13px] text-muted">
            Tick “Compare” on up to {COMPARE_LIMIT} listings, then diff their specs side by side here.
          </p>
          <Link
            href="/browse"
            className="mt-5 rounded-md bg-accent px-4 py-2 text-[13px] font-600 text-bg transition-transform hover:scale-[1.02]"
          >
            Browse capacity
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 overflow-x-auto rounded-lg border border-line bg-surface"
        >
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <caption className="sr-only">Side-by-side specification comparison</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="w-32 px-4 py-3 text-left text-[10px] uppercase tracking-[0.1em] text-faint">
                  Spec
                </th>
                {listings.map((listing) => (
                  <th key={listing.id} scope="col" className="px-4 py-3 text-left">
                    <div className="num text-[10px] text-faint">{listing.id}</div>
                    <div className="mt-0.5 font-display text-[14px] font-600 text-ink">
                      {listing.vendor} {listing.chip}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Link href={`/listings/${listing.slug}`} className="text-[11px] text-accent hover:underline">
                        details
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(listing.id)}
                        aria-label={`Remove ${listing.vendor} ${listing.chip} from comparison`}
                        className="text-[11px] text-faint transition-colors hover:text-danger"
                      >
                        remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, ri) => (
                <tr key={row.label} className={ri % 2 === 1 ? "bg-surface-2/50" : ""}>
                  <th scope="row" className="px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] text-faint">
                    {row.label}
                  </th>
                  {listings.map((listing) => (
                    <td key={listing.id} className="num px-4 py-2.5 text-ink">
                      {row.render(listing)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
