import { describe, expect, it } from "vitest";
import {
  billableMinutes,
  quoteForRange,
  quoteMinutes,
} from "./money";

const T0 = Date.UTC(2026, 0, 1, 0, 0, 0); // any fixed epoch base
const min = (n: number) => n * 60_000;

describe("billableMinutes", () => {
  it("rounds duration up to the next 15-minute increment", () => {
    expect(billableMinutes(T0, T0 + min(61))).toBe(75);
    expect(billableMinutes(T0, T0 + min(76))).toBe(90);
    expect(billableMinutes(T0, T0 + min(860))).toBe(870); // 14h20m -> 14h30m
  });

  it("keeps exact 15-minute multiples exact", () => {
    expect(billableMinutes(T0, T0 + min(90))).toBe(90);
    expect(billableMinutes(T0, T0 + min(1440))).toBe(1440);
  });

  it("rounds sub-minute remainders up to a whole minute first", () => {
    // 90 minutes + 1 second -> 91 minutes -> 105
    expect(billableMinutes(T0, T0 + min(90) + 1000)).toBe(105);
  });

  it("enforces the 1-hour minimum billable block", () => {
    expect(billableMinutes(T0, T0 + min(10))).toBe(60);
    expect(billableMinutes(T0, T0 + min(45))).toBe(60);
    expect(billableMinutes(T0, T0 + min(59))).toBe(60);
    expect(billableMinutes(T0, T0 + min(60))).toBe(60);
  });

  it("crosses the 24h threshold with the round-up applied", () => {
    // 24h01m -> 24h15m
    expect(billableMinutes(T0, T0 + min(1441))).toBe(1455);
  });

  it("rejects empty or inverted ranges", () => {
    expect(() => billableMinutes(T0, T0)).toThrowError(RangeError);
    expect(() => billableMinutes(T0 + min(10), T0)).toThrowError(RangeError);
  });
});

describe("quoteMinutes", () => {
  it("prices short bookings at the flat rate", () => {
    const q = quoteMinutes(100, 60);
    expect(q.totalCents).toBe(100);
    expect(q.discountCents).toBe(0);
  });

  it("charges exactly 24h with no discount", () => {
    const q = quoteMinutes(120, 1440);
    expect(q.baseCents).toBe(2_880);
    expect(q.excessMinutes).toBe(0);
    expect(q.totalCents).toBe(2_880);
  });

  it("discounts ONLY the hours beyond 24", () => {
    // 25h @ $1.20/h: first 24h = $28.80, hour 25 = $1.08
    const q = quoteMinutes(120, 1_500);
    expect(q.baseCents).toBe(2_880);
    expect(q.grossExcessCents).toBe(120);
    expect(q.excessCents).toBe(108);
    expect(q.discountCents).toBe(12);
    expect(q.totalCents).toBe(2_988);
  });

  it("discounts fractional excess in 15-minute steps", () => {
    // 24h15m @ $1.20/h: excess 15m gross 30c -> 27c
    const q = quoteMinutes(120, 1_455);
    expect(q.baseCents).toBe(2_880);
    expect(q.excessCents).toBe(27);
    expect(q.discountCents).toBe(3);
    expect(q.totalCents).toBe(2_907);
  });

  it("never discounts the base for very long bookings", () => {
    // 100h @ $0.61/h: base 24h = $14.64, 76h excess at 54.9c/h = $41.724 -> 4172c
    const q = quoteMinutes(61, 6_000);
    expect(q.baseCents).toBe(1_464);
    expect(q.excessCents).toBe(4_172);
    expect(q.totalCents).toBe(q.baseCents + q.excessCents);
  });

  it("rounds half-up to the nearest cent", () => {
    // 90 min @ 65c/h = 97.5c -> 98c
    expect(quoteMinutes(65, 90).totalCents).toBe(98);
    // 30 min @ 41c/h = 20.5c -> 21c
    expect(quoteMinutes(41, 30).totalCents).toBe(21);
  });

  it("returns integer cents everywhere", () => {
    const q = quoteMinutes(123, 2_000);
    for (const v of [
      q.baseCents,
      q.grossExcessCents,
      q.excessCents,
      q.discountCents,
      q.totalCents,
    ]) {
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe("quoteForRange", () => {
  it("applies rounding before pricing and reports the added minutes", () => {
    const q = quoteForRange(120, T0, T0 + min(1441));
    expect(q.billedMinutes).toBe(1_455);
    expect(q.roundingMinutes).toBe(14); // 1441 -> 1455
    expect(q.totalCents).toBe(2_907);
  });

  it("reports rounding from the 1-hour minimum", () => {
    const q = quoteForRange(58, T0, T0 + min(10));
    expect(q.billedMinutes).toBe(60);
    expect(q.roundingMinutes).toBe(50);
    expect(q.totalCents).toBe(58);
  });
});
