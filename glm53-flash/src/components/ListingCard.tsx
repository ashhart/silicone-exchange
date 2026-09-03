"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Listing } from "@/lib/types";
import { REGION_BY_CODE } from "@/data/regions";
import { formatCentsPerHour } from "@/lib/money";
import { StatusBadge } from "./StatusBadge";
import { CompareToggle } from "./CompareToggle";

export function ListingCard({
  listing,
  utilizationPct,
  index = 0,
}: {
  listing: Listing;
  utilizationPct: number;
  index?: number;
}) {
  const region = REGION_BY_CODE[listing.region];

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: "easeOut" }}
      className="lift group relative flex flex-col rounded-lg border border-line bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <StatusBadge status={listing.status} />
          <h3 className="mt-1.5 font-display text-[17px] font-600 text-ink">
            {listing.vendor} {listing.chip}
          </h3>
          <p className="num mt-0.5 text-[11px] text-faint">
            {listing.id} · {region?.label ?? listing.region}
          </p>
        </div>
        <CompareToggle id={listing.id} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-[12px]">
        <Spec label="Memory" value={`${listing.memoryGB} GB`} />
        <Spec label="Compute" value={`${listing.tflops} TF`} />
        <Spec label="Power" value={`${listing.maxPowerWatts} W`} />
      </dl>

      <div className="mt-3">
        <UtilizationBar pct={utilizationPct} />
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
        <div>
          <div className="num text-[19px] font-500 text-ink">{formatCentsPerHour(listing.hourlyRateCents)}</div>
          <div className="text-[11px] text-faint">billed in 15-min increments</div>
        </div>
        <Link
          href={`/listings/${listing.slug}`}
          className="rounded-md border border-line-strong px-3 py-1.5 text-[12px] text-ink transition-colors group-hover:border-accent group-hover:text-accent"
        >
          Reserve →
        </Link>
      </div>
    </motion.article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.08em] text-faint">{label}</dt>
      <dd className="num mt-0.5 text-ink">{value}</dd>
    </div>
  );
}

export function UtilizationBar({ pct }: { pct: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-faint">
        <span>30-day utilization</span>
        <span className="num text-muted">{pct.toFixed(1)}%</span>
      </div>
      <div
        className="mt-1 h-1 overflow-hidden rounded-full bg-surface-2"
        role="meter"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Average utilization ${pct.toFixed(1)} percent`}
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}
