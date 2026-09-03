import type { Reservation } from "@/lib/types";
import { DAY_MS, HOUR_MS } from "@/lib/time";
import { startOfDay } from "@/lib/time";
import { quoteReservation } from "@/lib/pricing";
import { LISTING_BY_ID } from "./listings";

/**
 * Pre-existing reservations, generated relative to "today" so the calendar
 * and dashboard always have meaningful content. Pure function of nowMs.
 *
 * The set deliberately includes:
 * - SEED-01: an 08:00–20:00 block that a naive "does the new start fall
 *   inside an existing range" check would combine with a 06:00–10:00
 *   candidate — the app's half-open overlap check must reject it.
 * - SEED-02/03: back-to-back 10:00–14:00 and 14:00–18:00 blocks that touch
 *   at a boundary and must both be allowed to exist.
 * - SEED-04: a 30-hour booking that exercises the >24h discount.
 * - SEED-06: a hold created 20 minutes ago — already past its 10-minute
 *   hold window, so it renders as expired immediately.
 * - SEED-10: a live hold with ~8 minutes left, so the dashboard has a
 *   running countdown on first visit.
 */
export function seedReservations(nowMs: number): Reservation[] {
  const dayStart = startOfDay(nowMs);
  const rateOf = (listingId: string): number => {
    const listing = LISTING_BY_ID[listingId];
    if (!listing) throw new Error(`Unknown listing ${listingId}`);
    return listing.hourlyRateCents;
  };
  const priceOf = (listingId: string, startMs: number, endMs: number): number => {
    const quote = quoteReservation({ startMs, endMs, hourlyRateCents: rateOf(listingId) });
    if (!quote) throw new Error(`Invalid seed range for ${listingId}`);
    return quote.totalCents;
  };

  const at = (dayOffset: number, hour: number): number => dayStart + dayOffset * DAY_MS + hour * HOUR_MS;

  const build = (
    id: string,
    listingId: string,
    startMs: number,
    endMs: number,
    status: Reservation["status"],
    createdAtMs: number,
  ): Reservation => ({
    id,
    listingId,
    startMs,
    endMs,
    status,
    createdAtMs,
    holdExpiresAtMs: status === "held" ? createdAtMs + 10 * 60_000 : null,
    priceCents: priceOf(listingId, startMs, endMs),
    hourlyRateCents: rateOf(listingId),
  });

  return [
    build("SEED-01", "LST-001", at(0, 8), at(0, 20), "confirmed", dayStart - 2 * DAY_MS),
    build("SEED-02", "LST-002", at(0, 10), at(0, 14), "confirmed", dayStart - 2 * DAY_MS),
    build("SEED-03", "LST-002", at(0, 14), at(0, 18), "confirmed", dayStart - 2 * DAY_MS),
    build("SEED-04", "LST-004", at(0, 6), at(1, 12), "confirmed", dayStart - 2 * DAY_MS),
    build("SEED-05", "LST-006", at(-1, 9), at(-1, 17), "confirmed", dayStart - 3 * DAY_MS),
    build("SEED-06", "LST-007", at(3, 12), at(3, 16), "held", nowMs - 20 * 60_000),
    build("SEED-07", "LST-009", at(2, 9), at(2, 11), "cancelled", dayStart - 3 * DAY_MS),
    build("SEED-08", "LST-001", at(5, 9), at(5, 13), "confirmed", dayStart - 2 * DAY_MS),
    build("SEED-09", "LST-013", at(0, 22), at(1, 2), "confirmed", dayStart - 2 * DAY_MS),
    build("SEED-10", "LST-016", at(1, 10), at(1, 12), "held", nowMs - 2 * 60_000),
  ];
}
