import type { Reservation } from "../lib/types";
import { quoteForRange } from "../lib/money";
import { DAY_MS, HOUR_MS, startOfUtcDay } from "../lib/time";
import { getListingById } from "./listings";

/**
 * Pre-existing reservations, anchored to the current time so the demo calendar
 * always shows a meaningful week. The list includes two back-to-back
 * bookings on SX-01 (ends 14:00Z / starts 14:00Z) that a naive `<=` overlap
 * check would wrongly treat as a conflict, plus a confirmed booking on a
 * listing that has since flipped to "maintenance".
 */
export function seedReservations(now: number): Reservation[] {
  const midnight = startOfUtcDay(now);
  const hourNow = Math.floor(now / HOUR_MS) * HOUR_MS;

  const spec: Array<Omit<Reservation, "priceCents">> = [
    {
      id: "seed-past-a100",
      listingId: "SX-03",
      start: midnight - 2 * DAY_MS + 2 * HOUR_MS,
      end: midnight - 2 * DAY_MS + 6 * HOUR_MS + 30 * 60_000,
      status: "confirmed",
      createdAt: midnight - 5 * DAY_MS,
      heldAt: midnight - 5 * DAY_MS,
      confirmedAt: midnight - 5 * DAY_MS + 4 * 60_000,
    },
    {
      // First half of the back-to-back pair on SX-01.
      id: "seed-today-h100-am",
      listingId: "SX-01",
      start: midnight + 9 * HOUR_MS,
      end: midnight + 14 * HOUR_MS,
      status: "confirmed",
      createdAt: midnight - 3 * DAY_MS,
      heldAt: midnight - 3 * DAY_MS,
      confirmedAt: midnight - 3 * DAY_MS + 2 * 60_000,
    },
    {
      // Second half: touches the first at exactly 14:00Z. Half-open ranges
      // make this legal; a naive overlap check flags it.
      id: "seed-today-h100-pm",
      listingId: "SX-01",
      start: midnight + 14 * HOUR_MS,
      end: midnight + 17 * HOUR_MS,
      status: "confirmed",
      createdAt: midnight - 2 * DAY_MS,
      heldAt: midnight - 2 * DAY_MS,
      confirmedAt: midnight - 2 * DAY_MS + 60_000,
    },
    {
      // Confirmed before SX-10 went into maintenance — must survive.
      id: "seed-maint-h100",
      listingId: "SX-10",
      start: midnight + DAY_MS,
      end: midnight + DAY_MS + 8 * HOUR_MS,
      status: "confirmed",
      createdAt: midnight - 6 * DAY_MS,
      heldAt: midnight - 6 * DAY_MS,
      confirmedAt: midnight - 6 * DAY_MS + 90_000,
    },
    {
      // A live hold created 4 minutes ago: the dashboard countdown shows ~6:00.
      id: "seed-hold-mi300x",
      listingId: "SX-07",
      start: hourNow + 2 * HOUR_MS,
      end: hourNow + 8 * HOUR_MS,
      status: "held",
      createdAt: now - 4 * 60_000,
      heldAt: now - 4 * 60_000,
    },
    {
      // Cancelled: must NOT block tomorrow's 20:00–22:00 window on SX-05.
      id: "seed-cancelled-4090",
      listingId: "SX-05",
      start: midnight + 20 * HOUR_MS,
      end: midnight + 22 * HOUR_MS,
      status: "cancelled",
      createdAt: midnight - DAY_MS,
      heldAt: midnight - DAY_MS,
      cancelledAt: midnight - 12 * HOUR_MS,
    },
  ];

  return spec.map((r) => ({
    ...r,
    priceCents: quoteForRange(
      requireRate(r.listingId),
      r.start,
      r.end,
    ).totalCents,
  }));
}

function requireRate(listingId: string): number {
  const listing = getListingById(listingId);
  if (!listing) throw new Error(`unknown listing: ${listingId}`);
  return listing.priceCentsPerHour;
}
