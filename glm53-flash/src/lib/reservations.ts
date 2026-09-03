import type { Reservation } from "./types";
import { rangesOverlap, type TimeRange } from "./overlap";
import { blocksSlot, effectiveStatus } from "./holds";

/**
 * True when the listing already has a held-or-confirmed reservation
 * overlapping the candidate range. Cancelled and expired holds never
 * conflict.
 */
export function hasBlockingConflict(
  listingId: string,
  range: TimeRange,
  reservations: readonly Reservation[],
  nowMs: number,
): boolean {
  return reservations.some(
    (res) =>
      res.listingId === listingId &&
      blocksSlot(res, nowMs) &&
      rangesOverlap(range, { startMs: res.startMs, endMs: res.endMs }),
  );
}

/** Total spend across confirmed reservations, integer cents. */
export function totalConfirmedSpend(reservations: readonly Reservation[]): number {
  return reservations.reduce((acc, res) => (res.status === "confirmed" ? acc + res.priceCents : acc), 0);
}

/** Reservations that currently occupy a slot, soonest first. */
export function activeReservations(reservations: readonly Reservation[], nowMs: number): Reservation[] {
  return reservations
    .filter((res) => {
      const status = effectiveStatus(res, nowMs);
      return status === "held" || status === "confirmed";
    })
    .sort((a, b) => a.startMs - b.startMs);
}
