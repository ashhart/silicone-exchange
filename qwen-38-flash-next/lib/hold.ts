import type { Reservation, ReservationStatus } from "./types";

/** A hold survives exactly 10 minutes; strictly more than this expires it. */
export const HOLD_TTL_MS = 10 * 60 * 1000;

/**
 * Status after applying hold expiry. A `held` reservation older than the TTL
 * is treated as `expired` everywhere: it no longer blocks a slot and no
 * longer counts toward spend.
 */
export function effectiveStatus(
  reservation: Reservation,
  now: number,
): ReservationStatus {
  if (
    reservation.status === "held" &&
    now - reservation.heldAt > HOLD_TTL_MS
  ) {
    return "expired";
  }
  return reservation.status;
}

/** Milliseconds a hold has left before expiring (0 once gone). */
export function holdRemainingMs(reservation: Reservation, now: number): number {
  if (reservation.status !== "held") return 0;
  return Math.max(0, reservation.heldAt + HOLD_TTL_MS - now);
}

/** Confirmed and live-held reservations are what the user is paying for. */
export function countsTowardSpend(
  reservation: Reservation,
  now: number,
): boolean {
  const status = effectiveStatus(reservation, now);
  return status === "confirmed" || status === "held";
}
