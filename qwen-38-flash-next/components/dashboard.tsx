"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useReservationStore } from "@/store/reservations";
import { countsTowardSpend, effectiveStatus } from "@/lib/hold";
import { getListingById } from "@/data/listings";
import { durationLabel, usd, utcLabel } from "@/lib/format";
import { useHydrated, useNow } from "@/lib/hooks";
import { EASE } from "./motion";
import { HoldCountdown } from "./countdown";
import { ReservationStatusBadge } from "./ui";
import type { Reservation } from "@/lib/types";

export function DashboardClient() {
  const hydrated = useHydrated();
  const now = useNow(1_000);
  const reservations = useReservationStore((s) => s.reservations);

  if (!hydrated || now === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Dashboard
        </h1>
        <div className="mt-6 h-48 animate-pulse border border-hairline bg-panel" />
      </div>
    );
  }

  const active = reservations
    .filter((r) => countsTowardSpend(r, now))
    .sort((a, b) => a.start - b.start);
  const history = reservations
    .filter((r) => !countsTowardSpend(r, now))
    .sort((a, b) => b.createdAt - a.createdAt);

  let confirmedCents = 0;
  let heldCents = 0;
  for (const r of active) {
    if (r.status === "confirmed") confirmedCents += r.priceCents;
    else heldCents += r.priceCents;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-dim">
        Live from localStorage — a full page reload keeps every reservation
        exactly where it was.
      </p>

      <section aria-label="Spend summary" className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
        <SummaryCell
          label="Running total (live bookings)"
          value={usd(confirmedCents + heldCents)}
          big
        />
        <SummaryCell label="Confirmed" value={usd(confirmedCents)} />
        <SummaryCell
          label="In 10-min holds"
          value={usd(heldCents)}
          note={heldCents > 0 ? "confirm before the clock runs out" : undefined}
        />
      </section>

      <section aria-labelledby="active-h" className="mt-10">
        <h2 id="active-h" className="font-display text-lg font-semibold">
          Active reservations
          <span className="ml-2 text-sm text-faint tabular-nums">
            {active.length}
          </span>
        </h2>
        {active.length === 0 ? (
          <EmptyBoard />
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-4 hidden border border-hairline bg-panel md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline text-[10px] tracking-widest text-faint uppercase">
                    <Th>status</Th>
                    <Th>listing</Th>
                    <Th>window (UTC)</Th>
                    <Th>billed</Th>
                    <Th className="text-right">price</Th>
                    <Th className="text-right">actions</Th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {active.map((r) => (
                      <motion.tr
                        key={r.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="border-b border-hairline last:border-b-0"
                      >
                        <RowCells r={r} now={now} asRow />
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <ul className="mt-4 space-y-3 md:hidden">
              <AnimatePresence initial={false}>
                {active.map((r) => (
                  <motion.li
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="border border-hairline bg-panel p-4"
                  >
                    <RowCells r={r} now={now} asRow={false} stacked />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </section>

      {history.length > 0 ? (
        <section aria-labelledby="history-h" className="mt-12">
          <h2 id="history-h" className="font-display text-lg font-semibold">
            History
            <span className="ml-2 text-sm text-faint tabular-nums">
              {history.length}
            </span>
          </h2>
          <ul className="mt-4 divide-y divide-hairline border border-hairline bg-panel">
            {history.map((r) => {
              const listing = getListingById(r.listingId);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-xs text-dim">
                  <ReservationStatusBadge status={effectiveStatus(r, now)} />
                  <span className="text-[10px] tabular-nums text-faint">
                    {r.id}
                  </span>
                  <Link
                    href={`/listings/${listing?.slug ?? "#"}`}
                    className="text-ink hover:text-accent"
                  >
                    {listing?.name ?? r.listingId}
                  </Link>
                  <span className="tabular-nums">
                    {utcLabel(r.start)} → {utcLabel(r.end)}
                  </span>
                  <span className="ml-auto tabular-nums line-through">
                    {usd(r.priceCents)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function RowCells({
  r,
  now,
  asRow,
  stacked = false,
}: {
  r: Reservation;
  now: number;
  asRow: boolean;
  stacked?: boolean;
}) {
  const listing = getListingById(r.listingId);
  const Cell = asRow ? Td : "div";
  return (
    <>
      <Cell className={stacked ? "flex items-center justify-between" : ""}>
        <ReservationStatusBadge status={effectiveStatus(r, now)} />
      </Cell>
      <Cell>
        <Link
          href={`/listings/${listing?.slug ?? "#"}`}
          className="text-ink hover:text-accent"
        >
          {listing?.name ?? r.listingId}
        </Link>
        <span className="block text-[10px] text-faint tabular-nums">
          {r.id} · {listing?.chip ?? "?"}
        </span>
      </Cell>
      <Cell className="tabular-nums">
        {utcLabel(r.start)}
        <span className="block text-[10px] text-faint">
          → {utcLabel(r.end)} · {durationLabel(Math.round((r.end - r.start) / 3_600_000 * 60))}
        </span>
      </Cell>
      <Cell className="tabular-nums text-dim">
        {r.status === "held" ? (
          <span className="text-warn">
            <HoldCountdown reservation={r} /> left
          </span>
        ) : (
          "—"
        )}
      </Cell>
      <Cell className="text-right font-display font-semibold text-ink tabular-nums">
        {usd(r.priceCents)}
      </Cell>
      <Cell className="text-right">
        {r.status === "held" ? (
          <button
            type="button"
            onClick={() =>
              useReservationStore.getState().confirm(r.id, Date.now())
            }
            className="mr-2 border border-accent bg-accent px-2 py-1 text-[10px] tracking-widest text-bg uppercase hover:bg-transparent hover:text-accent"
          >
            confirm
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => useReservationStore.getState().cancel(r.id, Date.now())}
          className="border border-hairline px-2 py-1 text-[10px] tracking-widest text-dim uppercase hover:border-bad hover:text-bad"
        >
          cancel
        </button>
      </Cell>
    </>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`px-4 py-2.5 font-normal ${className}`}>{children}</th>;
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

function SummaryCell({
  label,
  value,
  note,
  big = false,
}: {
  label: string;
  value: string;
  note?: string;
  big?: boolean;
}) {
  return (
    <div className="bg-panel p-5">
      <div className="text-[10px] tracking-widest text-faint uppercase">
        {label}
      </div>
      <div
        className={`mt-2 font-display font-semibold tabular-nums ${
          big ? "text-3xl text-accent" : "text-2xl text-ink"
        }`}
      >
        {value}
      </div>
      {note ? <div className="mt-1 text-[11px] text-warn">{note}</div> : null}
    </div>
  );
}

function EmptyBoard() {
  return (
    <div className="grid-bg mt-4 flex flex-col items-center gap-4 border border-dashed border-hairline-strong px-6 py-14 text-center">
      <p className="text-sm text-dim">
        No live reservations. Everything you hold or confirm shows up here,
        with a countdown on holds and a running spend total.
      </p>
      <Link
        href="/browse"
        className="border border-accent bg-accent px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-bg uppercase hover:bg-transparent hover:text-accent"
      >
        Find hardware
      </Link>
    </div>
  );
}
