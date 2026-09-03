import type { Listing, Reservation } from "./types";
import { effectiveStatus } from "./hold";

/**
 * Half-open range overlap: [aStart, aEnd) vs [bStart, bEnd).
 * Touching boundaries (one ends exactly where the other starts) do NOT
 * overlap. A naive `aStart <= bEnd && bStart <= aEnd` check would wrongly
 * reject those back-to-back bookings.
 */
export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** A reservation occupies its slot only while held (unexpired) or confirmed. */
export function blocksSlot(reservation: Reservation, now: number): boolean {
  const status = effectiveStatus(reservation, now);
  return status === "held" || status === "confirmed";
}

/**
 * The first active reservation on the same listing whose range overlaps
 * [start, end). Cancelled and expired holds never conflict.
 */
export function findConflict(
  reservations: readonly Reservation[],
  candidate: { listingId: string; start: number; end: number },
  now: number,
): Reservation | null {
  for (const r of reservations) {
    if (r.listingId !== candidate.listingId) continue;
    if (!blocksSlot(r, now)) continue;
    if (rangesOverlap(candidate.start, candidate.end, r.start, r.end)) {
      return r;
    }
  }
  return null;
}

export type ReserveRejection =
  | { ok: false; reason: "invalid-range" }
  | { ok: false; reason: "maintenance" }
  | { ok: false; reason: "retired" }
  | { ok: false; reason: "conflict"; conflict: Reservation };

export type ReserveVerdict = { ok: true } | ReserveRejection;

/**
 * Can a NEW reservation [start, end) be placed on this listing right now?
 * Maintenance and retired listings block new bookings; confirmed reservations
 * that already exist are untouched by a maintenance flip.
 */
export function canReserve(
  listing: Listing,
  reservations: readonly Reservation[],
  start: number,
  end: number,
  now: number,
): ReserveVerdict {
  if (end <= start) return { ok: false, reason: "invalid-range" };
  if (listing.status === "maintenance") {
    return { ok: false, reason: "maintenance" };
  }
  if (listing.status === "retired") {
    return { ok: false, reason: "retired" };
  }
  const conflict = findConflict(reservations, { listingId: listing.id, start, end }, now);
  if (conflict) return { ok: false, reason: "conflict", conflict };
  return { ok: true };
}
