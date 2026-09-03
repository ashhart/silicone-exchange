import { describe, expect, it } from "vitest";
import { seedReservations } from "./reservations";
import { rangesOverlap } from "../lib/overlap";
import { DAY_MS, HOUR_MS, startOfUtcDay } from "../lib/time";

const NOW = Date.UTC(2026, 8, 3, 11, 23, 40);

describe("seedReservations", () => {
  const seeds = seedReservations(NOW);

  it("is deterministic for a fixed clock", () => {
    expect(seedReservations(NOW)).toEqual(seeds);
  });

  it("anchors to UTC midnight/hour boundaries of the given now", () => {
    const midnight = startOfUtcDay(NOW);
    const am = seeds.find((r) => r.id === "seed-today-h100-am")!;
    expect(am.start).toBe(midnight + 9 * HOUR_MS);
    expect(am.end).toBe(midnight + 14 * HOUR_MS);
  });

  it("contains the back-to-back pair a naive overlap check would reject", () => {
    const am = seeds.find((r) => r.id === "seed-today-h100-am")!;
    const pm = seeds.find((r) => r.id === "seed-today-h100-pm")!;
    expect(am.listingId).toBe(pm.listingId);
    // Half-open: sharing the 14:00 boundary is legal.
    expect(rangesOverlap(am.start, am.end, pm.start, pm.end)).toBe(false);
    // The naive <= check would wrongly flag it.
    const naive = am.start <= pm.end && pm.start <= am.end;
    expect(naive).toBe(true);
  });

  it("keeps a confirmed reservation on a maintenance listing", () => {
    const maintenance = seeds.find((r) => r.id === "seed-maint-h100")!;
    expect(maintenance.status).toBe("confirmed");
    // The booking survives regardless of the listing flipping status.
    expect(maintenance.end - maintenance.start).toBe(8 * HOUR_MS);
  });

  it("seeds one live hold 4 minutes old and one cancelled booking", () => {
    const held = seeds.find((r) => r.id === "seed-hold-mi300x")!;
    expect(held.status).toBe("held");
    expect(NOW - held.heldAt).toBe(4 * 60_000);
    const cancelled = seeds.find((r) => r.id === "seed-cancelled-4090")!;
    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.end - cancelled.start).toBe(2 * HOUR_MS);
  });

  it("prices every seed in integer cents consistent with the listing rate", () => {
    for (const r of seeds) {
      expect(Number.isInteger(r.priceCents)).toBe(true);
      expect(r.priceCents).toBeGreaterThan(0);
    }
  });

  it("spans multiple days around the anchor", () => {
    const starts = seeds.map((r) => r.start);
    expect(Math.min(...starts)).toBeLessThan(startOfUtcDay(NOW)); // past booking
    expect(Math.max(...starts)).toBeGreaterThanOrEqual(startOfUtcDay(NOW) + DAY_MS); // tomorrow
  });
});
