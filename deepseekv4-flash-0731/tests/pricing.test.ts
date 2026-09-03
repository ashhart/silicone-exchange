import { describe, expect, it } from "vitest";
import { computePrice } from "@/lib/pricing";
import { HOUR_MS, MINUTE_MS } from "@/lib/time";

const T0 = Date.UTC(2026, 0, 1, 0, 0, 0);

describe("computePrice", () => {
  it("rounds time up to 15-minute increments", () => {
    // 1h10m → billed as 1h15m
    const p = computePrice(T0, T0 + 70 * MINUTE_MS, 100);
    expect(p.requestedMinutes).toBe(70);
    expect(p.billableMinutes).toBe(75);
    expect(p.totalCents).toBe(125);
  });

  it("enforces the 1-hour minimum billable block", () => {
    // 30 minutes still bills a full hour
    const p = computePrice(T0, T0 + 30 * MINUTE_MS, 100);
    expect(p.billableMinutes).toBe(60);
    expect(p.totalCents).toBe(100);
  });

  it("bills exact hours at the exact rate", () => {
    const p = computePrice(T0, T0 + 2 * HOUR_MS, 18900);
    expect(p.billableMinutes).toBe(120);
    expect(p.totalCents).toBe(37800);
    expect(p.savingsCents).toBe(0);
  });

  it("applies the 10% discount only to hours beyond the 24th", () => {
    // 25h: 24h full rate + 1h at 90%
    const p = computePrice(T0, T0 + 25 * HOUR_MS, 100);
    expect(p.fullRateBlocks).toBe(96);
    expect(p.discountedBlocks).toBe(4);
    expect(p.baseCents).toBe(2400);
    expect(p.discountedCents).toBe(90);
    expect(p.totalCents).toBe(2490);
    expect(p.savingsCents).toBe(10);
  });

  it("keeps the first 24 hours at full price even for long bookings", () => {
    // 26h15m: 24h full + 2h15m (9 blocks) at 90%
    const p = computePrice(T0, T0 + 26 * HOUR_MS + 15 * MINUTE_MS, 100);
    expect(p.fullRateBlocks).toBe(96);
    expect(p.discountedBlocks).toBe(9);
    expect(p.baseCents).toBe(2400);
    expect(p.discountedCents).toBe(203); // 9 blocks × $22.50 → $202.50 → rounds up
    expect(p.totalCents).toBe(2603);
  });

  it("never uses floating point for money — odd rates round up to whole cents", () => {
    // $1.01/h for 1h15m = 5 blocks × $0.2525 → $1.27
    const p = computePrice(T0, T0 + 75 * MINUTE_MS, 101);
    expect(p.totalCents).toBe(127);
    expect(Number.isInteger(p.totalCents)).toBe(true);
  });

  it("returns a zeroed breakdown for an inverted or empty range", () => {
    const p = computePrice(T0 + 5 * HOUR_MS, T0, 100);
    expect(p.totalCents).toBe(0);
    expect(p.billableBlocks).toBe(0);
    const same = computePrice(T0, T0, 100);
    expect(same.totalCents).toBe(0);
  });

  it("discount never applies to bookings at or under 24 hours", () => {
    const p = computePrice(T0, T0 + 24 * HOUR_MS, 100);
    expect(p.discountedBlocks).toBe(0);
    expect(p.savingsCents).toBe(0);
    expect(p.totalCents).toBe(2400);
  });
});
