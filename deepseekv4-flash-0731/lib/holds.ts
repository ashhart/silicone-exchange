import type { Reservation } from "@/data/types";

/** A held reservation whose 10-minute window has elapsed is expired. */
export function holdExpired(r: Reservation, nowMs: number): boolean {
  return r.status === "held" && r.heldUntilMs !== undefined && r.heldUntilMs <= nowMs;
}

export function msRemainingInHold(r: Reservation, nowMs: number): number {
  if (r.status !== "held" || r.heldUntilMs === undefined) return 0;
  return Math.max(0, r.heldUntilMs - nowMs);
}

/**
 * Returns a new array with every overdue held reservation flipped to expired,
 * or the same array reference when nothing changed.
 */
export function expireOverdueHolds(
  reservations: Reservation[],
  nowMs: number,
): Reservation[] {
  let changed = false;
  const next = reservations.map((r) => {
    if (!holdExpired(r, nowMs)) return r;
    changed = true;
    return { ...r, status: "expired" as const, heldUntilMs: undefined };
  });
  return changed ? next : reservations;
}
