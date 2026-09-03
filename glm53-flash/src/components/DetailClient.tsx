"use client";

import { useMemo } from "react";
import type { Listing } from "@/lib/types";
import { last24hSeries, averageUtilization } from "@/data/utilization";
import { useReservations } from "@/stores/reservations";
import { useReservationClock } from "@/lib/useReservationClock";
import { toChartPoints, UtilizationChart, chartSummary } from "./UtilizationChart";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { ReservationForm } from "./ReservationForm";
import { StatusBadge } from "./StatusBadge";
import { CompareToggle } from "./CompareToggle";

type DetailProps = {
  listing: Listing;
  regionLabel: string;
  rateLabel: string;
};

export function DetailClient({ listing, regionLabel, rateLabel }: DetailProps) {
  const reservations = useReservations((s) => s.reservations);
  const now = useReservationClock(30_000);

  // now === 0 during SSR/hydration: render skeletons, then real data.
  const series = useMemo(() => (now === 0 ? null : last24hSeries(listing, now)), [listing, now]);
  const avg = useMemo(() => (now === 0 ? null : averageUtilization(listing, now)), [listing, now]);

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-3">
            <StatusBadge status={listing.status} />
            <span className="num text-[11px] text-faint">{listing.id}</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-700 text-ink">
            {listing.vendor} {listing.chip}
          </h1>
          <p className="num mt-1 text-[12px] text-muted">
            {regionLabel} · {listing.site}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="num text-2xl font-500 text-ink">{rateLabel}</div>
            <div className="text-[11px] text-faint">15-min increments · 1 h min</div>
          </div>
          <CompareToggle id={listing.id} />
        </div>
      </header>

      <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-muted">{listing.description}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-line bg-surface p-5" aria-label="Utilization chart">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-[16px] font-600 text-ink">Utilization · last 24 h</h2>
              <span className="num text-[12px] text-muted">{avg !== null ? `avg ${avg.toFixed(1)}%` : ""}</span>
            </div>
            {series === null ? (
              <div className="h-56 w-full animate-pulse rounded bg-surface-2 sm:h-64" aria-hidden="true" />
            ) : (
              <>
                <UtilizationChart data={toChartPoints(series)} nowMs={now} accent="var(--accent)" />
                <details className="mt-2">
                  <summary className="cursor-pointer text-[11px] text-faint hover:text-muted">
                    Chart summary (text alternative)
                  </summary>
                  <p className="mt-1 text-[12px] text-muted">{chartSummary(toChartPoints(series))}</p>
                </details>
              </>
            )}
          </section>

          <section className="rounded-lg border border-line bg-surface p-5" aria-label="Availability calendar">
            <h2 className="font-display text-[16px] font-600 text-ink">Availability · next 7 days</h2>
            <p className="mt-1 text-[12px] text-muted">Each cell is one hour. Reserved hours are blocked out.</p>
            <div className="mt-4">
              {now === 0 ? (
                <div className="h-40 w-full animate-pulse rounded bg-surface-2" aria-hidden="true" />
              ) : (
                <AvailabilityCalendar listingId={listing.id} reservations={reservations} nowMs={now} />
              )}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-surface p-5" aria-label="Full specifications">
            <h2 className="font-display text-[16px] font-600 text-ink">Specifications</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
              <Spec label="Memory" value={`${listing.memoryGB} GB ${listing.memoryType}`} />
              <Spec label="Bandwidth" value={`${listing.bandwidthGBs.toLocaleString("en-US")} GB/s`} />
              <Spec label="Compute" value={`${listing.tflops} TFLOPS`} />
              <Spec label="Precision" value={listing.tflopsPrecision} />
              <Spec label="Interconnect" value={listing.interconnect} />
              <Spec label="Max power" value={`${listing.maxPowerWatts} W`} />
            </dl>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          {now === 0 ? (
            <div className="h-96 w-full animate-pulse rounded-lg bg-surface-2" aria-hidden="true" />
          ) : (
            <ReservationForm listing={listing} reservations={reservations} nowMs={now} />
          )}
        </aside>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.1em] text-faint">{label}</dt>
      <dd className="num mt-0.5 text-ink">{value}</dd>
    </div>
  );
}
