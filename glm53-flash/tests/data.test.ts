import { describe, expect, it } from "vitest";
import { hashString, mulberry32 } from "@/lib/rng";
import type { Reservation } from "@/lib/types";
import { formatCents } from "@/lib/money";
import { utilizationSeries, averageUtilization } from "@/data/utilization";
import { seedReservations } from "@/data/seedReservations";
import { LISTINGS } from "@/data/listings";
import { rangesOverlap } from "@/lib/overlap";
import { blocksSlot } from "@/lib/holds";

describe("deterministic RNG", () => {
  it("produces identical sequences for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("hashes strings stably and spreads distinct inputs", () => {
    expect(hashString("LST-001:29000000")).toBe(hashString("LST-001:29000000"));
    expect(hashString("a")).not.toBe(hashString("b"));
  });
});

describe("utilization data", () => {
  it("renders identically on repeated calls at the same instant", () => {
    const now = 1_790_000_000_000;
    const listing = LISTINGS[0];
    expect(utilizationSeries(listing, now)).toEqual(utilizationSeries(listing, now));
  });

  it("stays within 0–100% and within the power envelope", () => {
    const now = Date.now();
    for (const listing of LISTINGS) {
      for (const sample of utilizationSeries(listing, now)) {
        expect(sample.utilizationPct).toBeGreaterThanOrEqual(0);
        expect(sample.utilizationPct).toBeLessThanOrEqual(100);
        expect(sample.powerWatts).toBeLessThanOrEqual(listing.maxPowerWatts);
        expect(sample.powerWatts).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("covers 720 hourly samples and averages to a sane number", () => {
    const now = Date.now();
    const series = utilizationSeries(LISTINGS[0], now);
    expect(series).toHaveLength(720);
    const avg = averageUtilization(LISTINGS[0], now);
    expect(avg).toBeGreaterThan(0);
    expect(avg).toBeLessThanOrEqual(100);
  });
});

describe("seed reservations", () => {
  const now = new Date(2026, 8, 3, 15, 0, 0).getTime();
  const seeds = seedReservations(now);

  it("are internally consistent — no two blocking reservations on one listing overlap", () => {
    const byListing = new Map<string, Reservation[]>();
    for (const r of seeds) {
      if (!blocksSlot(r, now)) continue;
      const list = byListing.get(r.listingId) ?? [];
      for (const other of list) {
        expect(rangesOverlap({ startMs: r.startMs, endMs: r.endMs }, { startMs: other.startMs, endMs: other.endMs })).toBe(false);
      }
      list.push(r);
      byListing.set(r.listingId, list);
    }
  });

  it("include a live hold with time left on its countdown", () => {
    const live = seeds.find((r) => r.id === "SEED-10");
    expect(live?.status).toBe("held");
    expect(live && !blocksSlot(live, now + 60_000)).toBe(false);
  });

  it("include an already-lapsed hold", () => {
    const lapsed = seeds.find((r) => r.id === "SEED-06");
    expect(lapsed && blocksSlot(lapsed, now)).toBe(false);
  });
});

describe("money formatting", () => {
  it("formats integer cents without floating point drift", () => {
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(320)).toBe("$3.20");
    expect(formatCents(123456)).toBe("$1,234.56");
    expect(formatCents(5)).toBe("$0.05");
    expect(formatCents(-250)).toBe("-$2.50");
  });
});
