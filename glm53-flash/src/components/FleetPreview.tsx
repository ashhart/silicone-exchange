"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Listing } from "@/lib/types";
import { formatCentsPerHour } from "@/lib/money";
import { averageUtilization } from "@/data/utilization";
import { useReservationClock } from "@/lib/useReservationClock";
import { UtilizationBar } from "./ListingCard";

export function FleetPreview({ listings }: { listings: Listing[] }) {
  const now = useReservationClock(60_000);

  return (
    <section className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-600 text-ink">On the floor now</h2>
            <p className="mt-1 text-[13px] text-muted">Highest-throughput units available this minute.</p>
          </div>
          <Link href="/browse" className="shrink-0 text-[13px] text-accent underline-offset-4 hover:underline">
            All listings →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            >
              <Link
                href={`/listings/${listing.slug}`}
                className="lift block rounded-lg border border-line bg-surface p-4"
              >
                <div className="num text-[11px] text-faint">{listing.id}</div>
                <div className="mt-1 font-display text-[15px] font-600 text-ink">
                  {listing.vendor} {listing.chip}
                </div>
                <div className="num mt-3 text-[15px] text-ink">{formatCentsPerHour(listing.hourlyRateCents)}</div>
                <div className="mt-3">
                  {now === 0 ? (
                    <div className="h-[26px] animate-pulse rounded bg-surface-2" aria-hidden="true" />
                  ) : (
                    <UtilizationBar pct={averageUtilization(listing, now)} />
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
