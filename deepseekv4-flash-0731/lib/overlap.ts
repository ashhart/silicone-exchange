import type { Listing, Reservation } from "@/data/types";

/**
 * Half-open interval overlap: [aStart, aEnd) and [bStart, bEnd).
 * A reservation ending at 14:00 and one starting at 14:00 do NOT overlap.
 */
export function rangesOverlap(
  aStartMs: number,
  aEndMs: number,
  bStartMs: number,
  bEndMs: number,
): boolean {
  return aStartMs < bEndMs && bStartMs < aEndMs;
}

/** Held and confirmed reservations occupy the slot; cancelled and expired do not. */
export function isActiveReservation(r: Reservation): boolean {
  return r.status === "confirmed" || r.status === "held";
}

export function findConflicts(
  listingId: string,
  startMs: number,
  endMs: number,
  reservations: readonly Reservation[],
): Reservation[] {
  return reservations.filter(
    (r) =>
      r.listingId === listingId &&
      isActiveReservation(r) &&
      rangesOverlap(startMs, endMs, r.startMs, r.endMs),
  );
}

export type BlockReason = "maintenance" | "retired" | "overlap" | "invalid-range" | "unknown-listing";

export interface ReserveCheck {
  ok: boolean;
  reason?: BlockReason;
}

export function canReserve(
  listing: Listing,
  startMs: number,
  endMs: number,
  reservations: readonly Reservation[],
): ReserveCheck {
  if (listing.status === "maintenance") return { ok: false, reason: "maintenance" };
  if (listing.status === "retired") return { ok: false, reason: "retired" };
  if (endMs <= startMs) return { ok: false, reason: "invalid-range" };
  if (findConflicts(listing.id, startMs, endMs, reservations).length > 0)
    return { ok: false, reason: "overlap" };
  return { ok: true };
}
