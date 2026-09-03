"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Listing } from "@/data/types";
import { CHIP_BY_ID } from "@/data/chips";
import { REGION_BY_ID } from "@/data/regions";
import { getUtilization } from "@/data/utilization";
import { formatMoney } from "@/lib/time";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { UtilizationBar } from "@/components/UtilizationBar";
import { CompareToggle } from "@/components/CompareToggle";

export function ListingCard({ listing }: { listing: Listing }) {
  const chip = CHIP_BY_ID[listing.chipId]!;
  const region = REGION_BY_ID[listing.regionId];
  const samples = getUtilization(listing.id);
  const current = samples[samples.length - 1]?.utilization ?? 0;

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative flex flex-col rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line2"
    >
      <Link
        href={`/listings/${listing.slug}`}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`View ${listing.name}`}
      />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-faint">
            {region?.code} · {listing.rack}
          </p>
          <h3 className="mt-0.5 font-display text-base font-semibold leading-tight group-hover:text-accent">
            {listing.name}
          </h3>
        </div>
        <ListingStatusBadge status={listing.status} />
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-xs text-muted">
        <span title={`${chip.name} · ${chip.vendor}`}>
          <span className="text-ink">{chip.name}</span>
        </span>
        <span>{listing.memoryGB} GB</span>
        <span>{listing.tflops.toLocaleString("en-US")} TF</span>
        <span>{region?.city}</span>
      </div>

      <div className="relative z-10 mt-4 space-y-2">
        <UtilizationBar value={current} />
        <div className="flex items-end justify-between">
          <p className="font-mono text-lg font-semibold text-ink">
            {formatMoney(listing.hourlyRateCents)}
            <span className="text-xs font-normal text-muted">/hr</span>
          </p>
          <CompareToggle listingId={listing.id} />
        </div>
      </div>
    </motion.article>
  );
}
