"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReservations } from "@/stores/reservations";
import { useReservationClock } from "@/lib/useReservationClock";
import { effectiveStatus } from "@/lib/holds";
import { totalConfirmedSpend } from "@/lib/reservations";
import { formatDayTime, formatDuration, formatTimeRange } from "@/lib/time";
import { formatCents } from "@/lib/money";
import { LISTING_BY_ID } from "@/data/listings";
import { REGION_BY_CODE } from "@/data/regions";
import { ReservationStatusBadge } from "./StatusBadge";
import { HoldCountdown } from "./HoldCountdown";

export function DashboardClient() {
  const reservations = useReservations((s) => s.reservations);
  const hydrated = useReservations((s) => s.hydrated);
  const confirmReservation = useReservations((s) => s.confirmReservation);
  const cancelReservation = useReservations((s) => s.cancelReservation);
  const now = useReservationClock(1000);

  const sorted = [...reservations].sort((a, b) => b.createdAtMs - a.createdAtMs);
  const spend = totalConfirmedSpend(reservations);
  const activeCount = reservations.filter((r) => ["held", "confirmed"].includes(effectiveStatus(r, now))).length;

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-[13px] text-faint sm:px-6">Loading reservations…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-700 text-ink">My reservations</h1>
          <p className="mt-1 text-[13px] text-muted">
            {activeCount} active · {reservations.length} total · stored locally in this browser
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-5 py-3 text-right">
          <div className="text-[10px] uppercase tracking-[0.14em] text-faint">Total confirmed spend</div>
          <div className="num mt-0.5 text-2xl font-500 text-accent">{formatCents(spend)}</div>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="mt-16 flex flex-col items-center rounded-lg border border-dashed border-line-strong py-20 text-center">
          <h2 className="font-display text-lg font-600 text-ink">No reservations yet</h2>
          <p className="mt-1 max-w-sm text-[13px] text-muted">
            Browse the fleet and put a block on hold — it will show up here with a live countdown.
          </p>
          <Link
            href="/browse"
            className="mt-5 rounded-md bg-accent px-4 py-2 text-[13px] font-600 text-bg transition-transform hover:scale-[1.02]"
          >
            Browse capacity
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {sorted.map((res, i) => (
            <DashboardRow
              key={res.id}
              reservationId={res.id}
              listingId={res.listingId}
              startMs={res.startMs}
              endMs={res.endMs}
              createdAtMs={res.createdAtMs}
              status={effectiveStatus(res, now)}
              priceCents={res.priceCents}
              hourlyRateCents={res.hourlyRateCents}
              index={i}
              nowMs={now}
              onConfirm={() => confirmReservation(res.id)}
              onCancel={() => cancelReservation(res.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

type RowProps = {
  reservationId: string;
  listingId: string;
  startMs: number;
  endMs: number;
  createdAtMs: number;
  status: "held" | "confirmed" | "cancelled" | "expired";
  priceCents: number;
  hourlyRateCents: number;
  index: number;
  nowMs: number;
  onConfirm: () => void;
  onCancel: () => void;
};

function DashboardRow(props: RowProps) {
  const listing = LISTING_BY_ID[props.listingId];
  const region = listing ? REGION_BY_CODE[listing.region] : undefined;
  const durationMin = Math.round((props.endMs - props.startMs) / 60_000);
  const running = props.startMs <= props.nowMs && props.endMs > props.nowMs;

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(props.index * 0.04, 0.3) }}
      className="rounded-lg border border-line bg-surface p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ReservationStatusBadge status={props.status} />
            {running && props.status === "confirmed" ? (
              <span className="num rounded border border-ok/40 bg-ok/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-ok">
                running now
              </span>
            ) : null}
            <span className="num text-[11px] text-faint">{props.reservationId}</span>
          </div>
          <h2 className="mt-1.5 font-display text-[16px] font-600 text-ink">
            {listing ? (
              <Link href={`/listings/${listing.slug}`} className="hover:text-accent">
                {listing.vendor} {listing.chip}
              </Link>
            ) : (
              props.listingId
            )}
          </h2>
          <p className="num mt-0.5 text-[12px] text-muted">
            {formatDayTime(props.startMs)} → {formatTimeRange(props.startMs, props.endMs).split("–")[1]} ·{" "}
            {formatDuration(durationMin)} · {region?.site ?? ""}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="num text-[16px] font-500 text-ink">{formatCents(props.priceCents)}</div>
          {props.status === "held" ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-faint">expires in</span>
              <HoldCountdown createdAtMs={props.createdAtMs} />
            </div>
          ) : null}
          <div className="flex gap-2">
            {props.status === "held" ? (
              <button
                type="button"
                onClick={props.onConfirm}
                className="rounded-md bg-accent px-3 py-1.5 text-[12px] font-600 text-bg transition-transform hover:scale-[1.03]"
              >
                Confirm
              </button>
            ) : null}
            {props.status === "held" || props.status === "confirmed" ? (
              <button
                type="button"
                onClick={props.onCancel}
                className="rounded-md border border-line px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-danger hover:text-danger"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.li>
  );
}
