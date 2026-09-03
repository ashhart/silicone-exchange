"use client";

import { useState } from "react";
import Link from "next/link";
import type { Listing, Reservation } from "@/data/types";
import { useReservations } from "@/store/useReservations";
import { useNow } from "@/lib/useNow";
import { floorToHour, formatDateTime } from "@/lib/time";
import { AvailabilityCalendar, type TimeRange } from "@/components/AvailabilityCalendar";
import { PriceQuote } from "@/components/PriceQuote";
import { Countdown } from "@/components/Countdown";

interface ReservationFormProps {
  listing: Listing;
  reservations: Reservation[];
}

const QUICK_HOURS = [1, 4, 12, 24, 48];

export function ReservationForm({ listing, reservations }: ReservationFormProps) {
  const createHold = useReservations((s) => s.createHold);
  const confirm = useReservations((s) => s.confirm);
  const cancel = useReservations((s) => s.cancel);
  const allReservations = useReservations((s) => s.reservations);

  const [selection, setSelection] = useState<TimeRange | null>(null);
  const [heldId, setHeldId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const now = useNow(30_000);

  const held = heldId ? allReservations.find((r) => r.id === heldId) : undefined;
  const disabled = listing.status === "maintenance" || listing.status === "retired";

  const handleSelect = (range: TimeRange) => {
    setSelection(range);
    setError(null);
  };

  const handleQuick = (hours: number) => {
    const start = floorToHour(now);
    handleSelect({ startMs: start, endMs: start + hours * 3_600_000 });
  };

  const handleHold = () => {
    if (!selection) return;
    const result = createHold(listing.id, selection.startMs, selection.endMs);
    if (!result.ok || !result.reservation) {
      setError(
        result.reason === "overlap"
          ? "That range overlaps an existing reservation — pick a free slot."
          : result.reason === "maintenance"
            ? "This node is in maintenance and cannot be reserved."
            : result.reason === "retired"
              ? "This node is retired and cannot be reserved."
              : "That time range is not valid.",
      );
      return;
    }
    setHeldId(result.reservation.id);
    setError(null);
  };

  const handleConfirm = () => {
    if (heldId) confirm(heldId);
  };

  const handleDismissHold = () => {
    if (heldId && held?.status === "held") cancel(heldId);
    setHeldId(null);
    setSelection(null);
    setError(null);
  };

  if (held?.status === "held") {
    return (
      <div className="rounded-xl border border-warn/40 bg-warn/5 p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-warn">Slot held</p>
        <p className="mt-1 text-sm text-muted">
          {listing.name} · {formatDateTime(held.startMs)} → {formatDateTime(held.endMs)}
        </p>
        <p className="mt-3 font-mono text-sm">
          Hold expires in <Countdown targetMs={held.heldUntilMs ?? 0} />
        </p>
        <p className="mt-1 text-xs text-muted">
          Confirm to lock the booking, or let the hold expire to free the slot.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accentink transition-opacity hover:opacity-90"
          >
            Confirm reservation
          </button>
          <button
            type="button"
            onClick={handleDismissHold}
            className="rounded-md border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
          >
            Release hold
          </button>
        </div>
      </div>
    );
  }

  if (held?.status === "confirmed") {
    return (
      <div className="rounded-xl border border-ok/40 bg-ok/5 p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-ok">Reservation confirmed</p>
        <p className="mt-1 text-sm text-muted">
          {listing.name} · {formatDateTime(held.startMs)} → {formatDateTime(held.endMs)}
        </p>
        <p className="mt-3 text-sm">
          <Link href="/dashboard" className="font-medium text-accent underline-offset-2 hover:underline">
            View in dashboard
          </Link>
        </p>
      </div>
    );
  }

  if (held?.status === "expired") {
    return (
      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">Hold expired</p>
        <p className="mt-1 text-sm text-muted">
          The hold lapsed before confirmation and the slot has been released. Select a new range
          to try again.
        </p>
        <button
          type="button"
          onClick={handleDismissHold}
          className="mt-4 rounded-md border border-line bg-surface px-4 py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AvailabilityCalendar
        listing={listing}
        reservations={reservations}
        selection={selection}
        onSelect={handleSelect}
        disabled={disabled}
      />

      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">Quick:</span>
          {QUICK_HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => handleQuick(h)}
              className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-line2 hover:text-ink"
            >
              {h}h
            </button>
          ))}
        </div>
      )}

      {selection && !disabled && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-sm">
            <p className="text-muted">
              <span className="text-ink">{formatDateTime(selection.startMs)}</span>
              {" → "}
              <span className="text-ink">{formatDateTime(selection.endMs)}</span>
            </p>
            <button
              type="button"
              onClick={() => setSelection(null)}
              className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Clear
            </button>
          </div>
          <PriceQuote
            startMs={selection.startMs}
            endMs={selection.endMs}
            hourlyRateCents={listing.hourlyRateCents}
          />
          <button
            type="button"
            onClick={handleHold}
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accentink transition-opacity hover:opacity-90"
          >
            Hold this slot
          </button>
          <p className="text-xs text-muted">
            Holding reserves the slot for 10 minutes. Confirm before the countdown hits zero or
            the hold expires and the slot is released.
          </p>
        </>
      )}

      {error && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
