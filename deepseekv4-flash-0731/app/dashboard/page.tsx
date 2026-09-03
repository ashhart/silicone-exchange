"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMounted } from "@/lib/useMounted";
import { useNow } from "@/lib/useNow";
import { useReservations } from "@/store/useReservations";
import { LISTING_BY_SLUG } from "@/data/listings";
import { CHIP_BY_ID } from "@/data/chips";
import { computePrice } from "@/lib/pricing";
import { formatDateTime, formatMoney } from "@/lib/time";
import { ReservationStatusBadge } from "@/components/StatusBadge";
import { Countdown } from "@/components/Countdown";
import { EmptyState } from "@/components/EmptyState";

export default function DashboardPage() {
  const mounted = useMounted();
  const now = useNow(1000);
  const reservations = useReservations((s) => s.reservations);
  const confirm = useReservations((s) => s.confirm);
  const cancel = useReservations((s) => s.cancel);

  const stats = useMemo(() => {
    let confirmedTotal = 0;
    let heldCount = 0;
    for (const r of reservations) {
      const listing = LISTING_BY_SLUG[r.listingId];
      if (!listing) continue;
      if (r.status === "confirmed") {
        confirmedTotal += computePrice(r.startMs, r.endMs, listing.hourlyRateCents).totalCents;
      } else if (r.status === "held") {
        heldCount += 1;
      }
    }
    return { confirmedTotal, heldCount };
  }, [reservations]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface2" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-line bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  const sorted = [...reservations].sort((a, b) => b.startMs - a.startMs);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Your reservations, held and confirmed.</p>
        </div>
        <dl className="flex gap-3">
          <div className="rounded-xl border border-line bg-surface px-4 py-3">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Committed spend
            </dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-ink">
              {formatMoney(stats.confirmedTotal)}
            </dd>
          </div>
          <div className="rounded-xl border border-line bg-surface px-4 py-3">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Pending holds
            </dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-warn">{stats.heldCount}</dd>
          </div>
        </dl>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No reservations yet"
            body="Browse the floor and hold a slot — it will show up here with a live countdown."
            action={
              <Link
                href="/browse"
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accentink transition-opacity hover:opacity-90"
              >
                Browse compute
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {sorted.map((r) => {
            const listing = LISTING_BY_SLUG[r.listingId];
            if (!listing) return null;
            const chip = CHIP_BY_ID[listing.chipId]!;
            const price = computePrice(r.startMs, r.endMs, listing.hourlyRateCents);
            const cancellable =
              (r.status === "held" || r.status === "confirmed") && r.startMs > now;

            return (
              <li
                key={r.id}
                className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line2"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/listings/${listing.slug}`}
                        className="font-display text-sm font-semibold hover:text-accent"
                      >
                        {listing.name}
                      </Link>
                      <ReservationStatusBadge status={r.status} />
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {chip.name} · {formatDateTime(r.startMs)} → {formatDateTime(r.endMs)}
                    </p>
                    {r.status === "held" && r.heldUntilMs !== undefined && (
                      <p className="mt-2 font-mono text-xs">
                        <span className="text-muted">Hold expires in </span>
                        <Countdown targetMs={r.heldUntilMs} />
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-mono text-sm font-semibold text-ink">
                      {formatMoney(price.totalCents)}
                    </span>
                    {r.status === "held" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => confirm(r.id)}
                          className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accentink transition-opacity hover:opacity-90"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => cancel(r.id)}
                          className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {r.status === "confirmed" && cancellable && (
                      <button
                        type="button"
                        onClick={() => cancel(r.id)}
                        className="rounded-md border border-danger/30 bg-danger/5 px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
                      >
                        Cancel booking
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
