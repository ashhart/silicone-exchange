import type { Reservation, ReservationStatus } from "./types";

/** An unconfirmed hold lapses after 10 minutes and frees its slot. */
export const HOLD_DURATION_MS = 10 * 60_000;

/**
 * A hold is expired once it has been held for MORE than 10 minutes.
 * At exactly the 10-minute boundary it is still held.
 */
export function isHoldExpired(
  res: Pick<Reservation, "status" | "holdExpiresAtMs">,
  nowMs: number,
): boolean {
  return res.status === "held" && res.holdExpiresAtMs !== null && nowMs > res.holdExpiresAtMs;
}

/** Status with hold expiry applied: a lapsed hold reads as "expired". */
export function effectiveStatus(
  res: Pick<Reservation, "status" | "holdExpiresAtMs">,
  nowMs: number,
): ReservationStatus {
  return isHoldExpired(res, nowMs) ? "expired" : res.status;
}

/**
 * Whether this reservation currently occupies the slot. Held and confirmed
 * reservations block; cancelled and expired ones never do.
 */
export function blocksSlot(
  res: Pick<Reservation, "status" | "holdExpiresAtMs">,
  nowMs: number,
): boolean {
  const status = effectiveStatus(res, nowMs);
  return status === "held" || status === "confirmed";
}
