import type { Reservation } from "./types";
import { HOUR_MS, MINUTE_MS, startOfDay } from "@/lib/time";

let cached: Reservation[] | null = null;

/**
 * Pre-existing reservations, generated relative to "today" so the demo always
 * has live blocks on the availability calendar.
 *
 * Includes:
 *  - an adjacent half-open pair (10:00–14:00 and 14:00–18:00) that a naive
 *    `<=`-based overlap check would wrongly flag as conflicting;
 *  - a cancelled reservation overlapping a confirmed one (cancelled must not
 *    block anything);
 *  - a held reservation expiring ~2 minutes after first load.
 */
export function seedReservations(): Reservation[] {
  if (cached) return cached;

  const todayMs = startOfDay(Date.now()).getTime();
  const at = (dayOffset: number, hour: number) => todayMs + dayOffset * 24 * HOUR_MS + hour * HOUR_MS;
  const now = Date.now();

  cached = [
    {
      id: "seed-adjacent-1",
      listingId: "h100-01-iad",
      startMs: at(0, 10),
      endMs: at(0, 14),
      status: "confirmed",
      createdAtMs: at(-1, 9),
      confirmedAtMs: at(-1, 9),
    },
    {
      id: "seed-adjacent-2",
      listingId: "h100-01-iad",
      startMs: at(0, 14),
      endMs: at(0, 18),
      status: "confirmed",
      createdAtMs: at(-1, 9),
      confirmedAtMs: at(-1, 9),
    },
    {
      id: "seed-cancelled",
      listingId: "h100-01-iad",
      startMs: at(0, 12),
      endMs: at(0, 16),
      status: "cancelled",
      createdAtMs: at(-2, 10),
    },
    {
      id: "seed-held-expiring",
      listingId: "h200-02-iad",
      startMs: at(1, 2),
      endMs: at(1, 6),
      status: "held",
      createdAtMs: now - 8 * MINUTE_MS,
      heldUntilMs: now + 2 * MINUTE_MS,
    },
    {
      id: "seed-long",
      listingId: "b200-04-iad",
      startMs: at(1, 0),
      endMs: at(2, 12),
      status: "confirmed",
      createdAtMs: at(-3, 8),
      confirmedAtMs: at(-3, 8),
    },
    {
      id: "seed-3",
      listingId: "mi300x-01-pdx",
      startMs: at(0, 20),
      endMs: at(1, 4),
      status: "confirmed",
      createdAtMs: at(-2, 12),
      confirmedAtMs: at(-2, 12),
    },
    {
      id: "seed-4",
      listingId: "h100-01-dub",
      startMs: at(2, 8),
      endMs: at(2, 16),
      status: "confirmed",
      createdAtMs: at(-1, 15),
      confirmedAtMs: at(-1, 15),
    },
    {
      id: "seed-5",
      listingId: "h200-01-fra",
      startMs: at(3, 6),
      endMs: at(3, 14),
      status: "confirmed",
      createdAtMs: at(-1, 16),
      confirmedAtMs: at(-1, 16),
    },
    {
      id: "seed-6",
      listingId: "h100-01-sin",
      startMs: at(1, 12),
      endMs: at(1, 20),
      status: "confirmed",
      createdAtMs: at(-2, 14),
      confirmedAtMs: at(-2, 14),
    },
    {
      id: "seed-7",
      listingId: "h200-01-nrt",
      startMs: at(4, 0),
      endMs: at(4, 24),
      status: "confirmed",
      createdAtMs: at(-1, 18),
      confirmedAtMs: at(-1, 18),
    },
    {
      id: "seed-8",
      listingId: "rtxpro6000-03-dub",
      startMs: at(0, 9),
      endMs: at(0, 13),
      status: "confirmed",
      createdAtMs: at(-1, 11),
      confirmedAtMs: at(-1, 11),
    },
    {
      id: "seed-9",
      listingId: "mi325x-02-dub",
      startMs: at(2, 2),
      endMs: at(2, 10),
      status: "confirmed",
      createdAtMs: at(-2, 9),
      confirmedAtMs: at(-2, 9),
    },
    {
      id: "seed-10",
      listingId: "h100-02-pdx",
      startMs: at(5, 6),
      endMs: at(5, 18),
      status: "confirmed",
      createdAtMs: at(-1, 8),
      confirmedAtMs: at(-1, 8),
    },
  ];

  return cached;
}
