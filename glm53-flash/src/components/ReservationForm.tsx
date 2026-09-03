"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Listing, Reservation } from "@/lib/types";
import { quoteReservation } from "@/lib/pricing";
import { hasBlockingConflict } from "@/lib/reservations";
import { formatCents } from "@/lib/money";
import { formatDayTime, formatDuration, formatTime, HOUR_MS, MINUTE_MS, startOfDay } from "@/lib/time";
import { useReservations } from "@/stores/reservations";
import { HoldCountdown } from "./HoldCountdown";

type FormState = {
  dayOffset: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
};

const DURATIONS = [60, 120, 240, 480, 1440, 1800] as const;

function initialForm(nowMs: number): FormState {
  const d = new Date(nowMs);
  return {
    dayOffset: 0,
    startHour: Math.min(23, d.getHours() + 1),
    startMinute: 0,
    durationMinutes: 120,
  };
}

export function ReservationForm({
  listing,
  reservations,
  nowMs,
}: {
  listing: Listing;
  reservations: readonly Reservation[];
  nowMs: number;
}) {
  const createHold = useReservations((s) => s.createHold);
  const [form, setForm] = useState<FormState>(() => initialForm(nowMs));
  const [feedback, setFeedback] = useState<{ kind: "error" | "success"; text: string; holdId?: string; heldAtMs?: number } | null>(null);

  const range = useMemo(() => {
    const dayStart = startOfDay(nowMs) + form.dayOffset * 24 * HOUR_MS;
    const startMs = dayStart + form.startHour * HOUR_MS + form.startMinute * MINUTE_MS;
    return { startMs, endMs: startMs + form.durationMinutes * MINUTE_MS };
  }, [form, nowMs]);

  const quote = quoteReservation({ startMs: range.startMs, endMs: range.endMs, hourlyRateCents: listing.hourlyRateCents });
  const conflict = hasBlockingConflict(listing.id, range, reservations, nowMs);
  const inPast = range.startMs < nowMs;
  const bookable = listing.status === "available" && quote !== null && !conflict && !inPast;
  const submit = () => {
    const result = createHold({ listingId: listing.id, startMs: range.startMs, endMs: range.endMs, nowMs: Date.now() });
    if (result.ok) {
      setFeedback({ kind: "success", text: `Hold placed on ${formatTime(range.startMs)}–${formatTime(range.endMs)}. Confirm within 10 minutes.`, holdId: result.reservation.id, heldAtMs: Date.now() });
    } else {
      setFeedback({ kind: "error", text: result.reason });
    }
  };

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <h3 className="font-display text-[16px] font-600 text-ink">Reserve this unit</h3>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-faint">Day</span>
          <select
            value={form.dayOffset}
            onChange={(e) => setForm((f) => ({ ...f, dayOffset: Number(e.target.value) }))}
            className="w-full rounded-md border border-line bg-bg px-2 py-2 text-[13px] text-ink"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>
                {d === 0 ? "Today" : d === 1 ? "Tomorrow" : `+${d} days`}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-faint">Start</span>
          <select
            value={form.startHour}
            onChange={(e) => setForm((f) => ({ ...f, startHour: Number(e.target.value) }))}
            className="w-full rounded-md border border-line bg-bg px-2 py-2 text-[13px] text-ink"
            aria-label="Start hour"
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}:00
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-faint">Minutes past</span>
          <select
            value={form.startMinute}
            onChange={(e) => setForm((f) => ({ ...f, startMinute: Number(e.target.value) }))}
            className="w-full rounded-md border border-line bg-bg px-2 py-2 text-[13px] text-ink"
            aria-label="Start minutes"
          >
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>
                :{String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-faint">Duration</span>
          <select
            value={form.durationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
            className="w-full rounded-md border border-line bg-bg px-2 py-2 text-[13px] text-ink"
          >
            {DURATIONS.map((m) => (
              <option key={m} value={m}>
                {formatDuration(m)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="num mt-3 text-[12px] text-muted">
        {formatDayTime(range.startMs)} → {formatTime(range.endMs)}
      </p>

      {quote ? (
        <motion.div
          key={`${quote.billedMinutes}-${quote.totalCents}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-md border border-line bg-bg p-4"
          aria-live="polite"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.1em] text-faint">Live quote</span>
            <span className="num text-2xl font-500 text-ink">{formatCents(quote.totalCents)}</span>
          </div>
          <dl className="mt-3 space-y-1.5 text-[12px]">
            <QuoteRow
              label={`Base ${formatDuration(quote.billedMinutes)}${quote.minimumApplied ? " (1 h minimum)" : ""}`}
              value={formatCents(quote.grossCents)}
            />
            {quote.roundedUpMinutes > 0 ? (
              <QuoteRow label="Rounded up to 15-min increments" value={`+${quote.roundedUpMinutes} min billed`} muted />
            ) : null}
            {quote.discountCents > 0 ? (
              <QuoteRow
                label={`Long-run discount · 10% off ${formatDuration(quote.excessMinutes)} past 24 h`}
                value={`−${formatCents(quote.discountCents)}`}
                accent
              />
            ) : null}
            <QuoteRow label="Rate" value={`${formatCents(listing.hourlyRateCents)}/hr`} muted />
          </dl>
        </motion.div>
      ) : null}

      {conflict ? (
        <p className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[12px] text-danger">
          That block overlaps an existing reservation. Pick another window — the calendar shows taken hours.
        </p>
      ) : inPast ? (
        <p className="mt-3 rounded-md border border-warn/40 bg-warn/10 px-3 py-2 text-[12px] text-warn">
          That start time is already in the past.
        </p>
      ) : null}

      <button
        type="button"
        onClick={submit}
        disabled={!bookable}
        className={`mt-4 w-full rounded-md px-4 py-2.5 text-[13px] font-600 transition-all ${
          bookable
            ? "bg-accent text-bg hover:scale-[1.01]"
            : "cursor-not-allowed border border-line bg-surface-2 text-faint"
        }`}
      >
        {listing.status !== "available"
          ? listing.status === "maintenance"
            ? "Under maintenance — not accepting holds"
            : "Retired from the pool"
          : conflict || inPast
            ? "Unavailable at this time"
            : `Hold for 10 minutes · ${quote ? formatCents(quote.totalCents) : ""}`}
      </button>

      <AnimatePresence>
        {feedback ? (
          <motion.div
            key={feedback.text + String(feedback.holdId)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-3 rounded-md border px-3 py-2 text-[12px] ${
              feedback.kind === "success"
                ? "border-ok/40 bg-ok/10 text-ok"
                : "border-danger/40 bg-danger/10 text-danger"
            }`}
            role="status"
          >
            {feedback.text}
            {feedback.kind === "success" ? (
              <span className="mt-1 block">
                Countdown: <HoldCountdown createdAtMs={feedback.heldAtMs ?? 0} /> ·{" "}
                <a href="/dashboard" className="underline underline-offset-2">
                  open dashboard to confirm
                </a>
              </span>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function QuoteRow({ label, value, muted = false, accent = false }: { label: string; value: string; muted?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className={muted ? "text-faint" : "text-muted"}>{label}</dt>
      <dd className={`num ${accent ? "text-ok" : muted ? "text-faint" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
