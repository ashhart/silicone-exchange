"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Listing } from "@/lib/types";
import { canReserve } from "@/lib/overlap";
import { quoteForRange, type Quote } from "@/lib/money";
import { ceilToHour, HOUR_MS } from "@/lib/time";
import { durationLabel, usd, utcLabel } from "@/lib/format";
import { useHydrated, useNow } from "@/lib/hooks";
import { cx } from "@/lib/cx";
import { useReservationStore } from "@/store/reservations";
import { HoldCountdown } from "./countdown";

const MAX_OFFSET_H = 24 * 7; // book up to a week out
const MAX_DURATION_H = 72;
const QUICK_DURATIONS = [1, 4, 8, 24, 48, 72];

export function ReservationForm({ listing }: { listing: Listing }) {
  const hydrated = useHydrated();
  const now = useNow(1_000);
  const reservations = useReservationStore((s) => s.reservations);

  const [startOffH, setStartOffH] = useState(2);
  const [durH, setDurH] = useState(4);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const hourNow = now > 0 ? ceilToHour(now) : 0;
  const start = hourNow + startOffH * HOUR_MS;
  const end = start + durH * HOUR_MS;
  const quote = useMemo(
    () => quoteForRange(listing.priceCentsPerHour, start, end),
    [listing.priceCentsPerHour, start, end],
  );
  const verdict = canReserve(
    listing,
    reservations,
    start,
    end,
    now,
  );
  const ticket = ticketId
    ? reservations.find((r) => r.id === ticketId)
    : undefined;

  if (!hydrated || now === 0) {
    return (
      <section aria-labelledby="book-h">
        <h2 id="book-h" className="font-display text-lg font-semibold">
          Reserve this node
        </h2>
        <div className="mt-4 h-64 animate-pulse border border-hairline bg-panel" />
      </section>
    );
  }

  const bookable = listing.status === "available";

  const book = () => {
    setFormError(null);
    const result = useReservationStore
      .getState()
      .createHold(listing.id, start, end, Date.now());
    if (result.ok) setTicketId(result.id);
    else setFormError(result.error);
  };

  return (
    <section aria-labelledby="book-h">
      <h2 id="book-h" className="font-display text-lg font-semibold">
        Reserve this node
      </h2>

      {ticket ? (
        <TicketPanel
          ticketId={ticket.id}
          onDone={() => {
            setTicketId(null);
            setFormError(null);
          }}
        />
      ) : !bookable ? (
        <div className="mt-4 border border-warn/40 bg-panel p-5 text-sm">
          <p className="text-warn">
            {listing.status === "maintenance"
              ? "Under maintenance — new reservations are paused."
              : "This listing is retired and no longer accepts reservations."}
          </p>
          {listing.status === "maintenance" ? (
            <p className="mt-2 text-xs text-dim">
              Existing confirmed reservations are unaffected and will run as
              scheduled.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 grid gap-6 border border-hairline bg-panel p-4 sm:p-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="start-off" className="text-[10px] tracking-widest text-faint uppercase">
                  Start
                </label>
                <span className="text-xs text-ink tabular-nums">
                  +{startOffH}h · {utcLabel(start)}
                </span>
              </div>
              <input
                id="start-off"
                type="range"
                min={0}
                max={MAX_OFFSET_H - 1}
                step={1}
                value={startOffH}
                onChange={(e) => setStartOffH(Number(e.target.value))}
                className="mt-2 w-full"
                aria-valuetext={`starts in ${startOffH} hours`}
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="duration" className="text-[10px] tracking-widest text-faint uppercase">
                  Duration
                </label>
                <span className="text-xs text-ink tabular-nums">
                  {durH}h → {utcLabel(end)}
                </span>
              </div>
              <input
                id="duration"
                type="range"
                min={1}
                max={MAX_DURATION_H}
                step={1}
                value={durH}
                onChange={(e) => setDurH(Number(e.target.value))}
                className="mt-2 w-full"
                aria-valuetext={`${durH} hours`}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurH(d)}
                    aria-pressed={durH === d}
                    className={cx(
                      "border px-2 py-0.5 text-[10px] tabular-nums transition-colors",
                      durH === d
                        ? "border-accent text-accent"
                        : "border-hairline text-dim hover:border-accent/60 hover:text-ink",
                    )}
                  >
                    {d}h
                  </button>
                ))}
              </div>
            </div>

            <QuoteBreakdown listing={listing} quote={quote} />

            {verdict.ok === false && verdict.reason === "conflict" ? (
              <p role="alert" className="border border-bad/40 px-3 py-2 text-xs text-bad">
                Overlaps {verdict.conflict.id} (
                {utcLabel(verdict.conflict.start)} → {utcLabel(verdict.conflict.end)}
                ). Drag the sliders to another window.
              </p>
            ) : null}
            {formError ? (
              <p role="alert" className="border border-bad/40 px-3 py-2 text-xs text-bad">
                {formError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={book}
              disabled={verdict.ok === false}
              className={cx(
                "w-full border px-4 py-3 text-xs font-semibold tracking-[0.14em] uppercase transition-colors",
                verdict.ok
                  ? "border-accent bg-accent text-bg hover:bg-transparent hover:text-accent"
                  : "cursor-not-allowed border-hairline text-faint",
              )}
            >
              Place 10:00 hold — {usd(quote.totalCents)}
            </button>
            <p className="text-[10px] leading-relaxed text-faint">
              Holds reserve the slot for 10:00 while you confirm, and expire
              automatically after. Billing: 15-minute blocks, rounded up, 1h
              minimum; hours beyond 24 continuous are 10% off.
            </p>
          </div>

          <div className="border-t border-hairline pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <h3 className="text-[10px] tracking-widest text-faint uppercase">
              Live quote
            </h3>
            <motion.div
              key={quote.totalCents}
              initial={{ scale: 0.96, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="mt-2 font-display text-4xl font-semibold text-accent tabular-nums"
            >
              {usd(quote.totalCents)}
            </motion.div>
            <dl className="mt-4 text-sm">
              <LineRow
                k="Window"
                v={`${utcLabel(start)} → ${utcLabel(end)}`}
              />
              <LineRow
                k="Billed"
                v={`${durationLabel(quote.billedMinutes)}${
                  quote.roundingMinutes > 0
                    ? ` (+${durationLabel(quote.roundingMinutes)} round-up)`
                    : " (exact)"
                }`}
              />
              <LineRow
                k={`Base ${(quote.baseMinutes / 60).toFixed(2)}h × ${usd(listing.priceCentsPerHour)}`}
                v={usd(quote.baseCents)}
              />
              {quote.excessMinutes > 0 ? (
                <LineRow
                  k={`Excess ${(quote.excessMinutes / 60).toFixed(2)}h less 10% (from ${usd(quote.grossExcessCents)})`}
                  v={usd(quote.excessCents)}
                />
              ) : null}
              {quote.discountCents > 0 ? (
                <LineRow k="Over-24h discount" v={`−${usd(quote.discountCents)}`} accent />
              ) : null}
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}

function TicketPanel({
  ticketId,
  onDone,
}: {
  ticketId: string;
  onDone: () => void;
}) {
  const reservation = useReservationStore((s) =>
    s.reservations.find((r) => r.id === ticketId),
  );
  const [error, setError] = useState<string | null>(null);

  if (!reservation) {
    return (
      <div className="mt-4 border border-hairline bg-panel p-5 text-sm text-dim">
        Ticket {ticketId} no longer exists.{" "}
        <button type="button" onClick={onDone} className="text-accent underline">
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-accent/40 bg-panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-ink">
          Ticket <span className="text-accent">{reservation.id}</span> —{" "}
          {utcLabel(reservation.start)} → {utcLabel(reservation.end)} ·{" "}
          {usd(reservation.priceCents)}
        </p>
        {reservation.status === "held" ? (
          <p className="text-xs text-dim">
            Expires in <HoldCountdown reservation={reservation} className="text-warn font-semibold" />
          </p>
        ) : null}
      </div>

      {reservation.status === "held" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              const result = useReservationStore
                .getState()
                .confirm(reservation.id, Date.now());
              if (!result.ok) setError(result.error);
            }}
            className="border border-accent bg-accent px-4 py-2 text-xs font-semibold tracking-[0.14em] text-bg uppercase hover:bg-transparent hover:text-accent"
          >
            Confirm now
          </button>
          <button
            type="button"
            onClick={() => {
              useReservationStore
                .getState()
                .cancel(reservation.id, Date.now());
            }}
            className="border border-hairline px-4 py-2 text-xs tracking-[0.14em] text-dim uppercase hover:border-bad hover:text-bad"
          >
            Release hold
          </button>
        </div>
      ) : reservation.status === "confirmed" ? (
        <p className="mt-3 text-sm text-good">
          Confirmed. It is now on your{" "}
          <Link href="/dashboard" className="underline">
            dashboard
          </Link>
          .
        </p>
      ) : (
        <p className="mt-3 text-sm text-dim">
          {reservation.status === "expired"
            ? "The hold timed out and the slot is free again."
            : "The hold was released."}{" "}
          <button type="button" onClick={onDone} className="text-accent underline">
            Book again
          </button>
        </p>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-xs text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function QuoteBreakdown({
  listing,
  quote,
}: {
  listing: Listing;
  quote: Quote;
}) {
  return (
    <div className="border-t border-hairline pt-4 text-[10px] leading-relaxed text-faint">
      Rate {usd(listing.priceCentsPerHour)}/GPU-h · billed{" "}
      {durationLabel(quote.billedMinutes)} · integer-cent accounting. Drag the
      sliders — the quote recalculates live.
    </div>
  );
}

function LineRow({
  k,
  v,
  accent = false,
}: {
  k: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-hairline py-1.5 last:border-b-0">
      <dt className="text-[11px] text-dim">{k}</dt>
      <dd
        className={cx(
          "shrink-0 text-sm tabular-nums",
          accent ? "text-accent" : "text-ink",
        )}
      >
        {v}
      </dd>
    </div>
  );
}
