import { describe, expect, it } from "vitest";
import { quoteReservation } from "@/lib/pricing";
import { HOUR_MS, MINUTE_MS } from "@/lib/time";

const RATE = 320; // $3.20/hr
const BASE = Date.UTC(2026, 5, 1, 0, 0, 0);

function quote(minutes: number) {
  return quoteReservation({ startMs: BASE, endMs: BASE + minutes * MINUTE_MS, hourlyRateCents: RATE });
}

describe("quoteReservation — 15-minute round-up", () => {
  it("bills a 45-minute booking as a full hour (minimum applies)", () => {
    const q = quote(45);
    expect(q).not.toBeNull();
    expect(q!.billedMinutes).toBe(60);
    expect(q!.minimumApplied).toBe(true);
    expect(q!.totalCents).toBe(320);
  });

  it("rounds 61 minutes up to 75 billed minutes", () => {
    const q = quote(61);
    expect(q!.billedMinutes).toBe(75);
    expect(q!.roundedUpMinutes).toBe(14);
    expect(q!.totalCents).toBe(400); // 5 quarters × $0.80
  });

  it("rounds a 1-second booking to a full billable hour", () => {
    const q = quoteReservation({ startMs: BASE, endMs: BASE + 1, hourlyRateCents: RATE });
    expect(q!.billedMinutes).toBe(60);
    expect(q!.minimumApplied).toBe(true);
    expect(q!.totalCents).toBe(320);
  });

  it("rounds sub-minute remainders up (90 minutes → 105 billed)", () => {
    const q = quoteReservation({ startMs: BASE, endMs: BASE + 90 * MINUTE_MS + 30_000, hourlyRateCents: RATE });
    expect(q!.billedMinutes).toBe(105);
    expect(q!.totalCents).toBe(560); // 7 quarters × $0.80
  });
});

describe("quoteReservation — 1-hour minimum", () => {
  it("bills a 5-minute booking as a full hour", () => {
    const q = quote(5);
    expect(q!.billedMinutes).toBe(60);
    expect(q!.minimumApplied).toBe(true);
    expect(q!.totalCents).toBe(RATE);
  });

  it("bills exactly one hour at the hourly rate", () => {
    const q = quote(60);
    expect(q!.minimumApplied).toBe(false);
    expect(q!.totalCents).toBe(RATE);
  });

  it("does not inflate a booking that rounds up to a full hour", () => {
    const q = quote(50);
    expect(q!.billedMinutes).toBe(60);
    expect(q!.minimumApplied).toBe(false);
    expect(q!.totalCents).toBe(RATE);
  });
});

describe("quoteReservation — >24h discount on excess only", () => {
  it("charges exactly 24h with no discount", () => {
    const q = quote(24 * 60);
    expect(q!.discountCents).toBe(0);
    expect(q!.totalCents).toBe(24 * RATE);
  });

  it("discounts only the hours beyond the 24th (25h booking)", () => {
    const q = quote(25 * 60);
    // First 24h at full rate, the extra hour at 10% off.
    expect(q!.totalCents).toBe(24 * RATE + Math.floor(RATE * 0.9));
    expect(q!.discountCents).toBe(Math.floor(RATE / 10));
    expect(q!.excessMinutes).toBe(60);
  });

  it("discounts every excess hour for a 30-hour booking", () => {
    const q = quote(30 * 60);
    expect(q!.totalCents).toBe(24 * RATE + 6 * Math.floor(RATE * 0.9));
    expect(q!.excessMinutes).toBe(360);
  });

  it("applies the discount to the rounded excess, not the raw duration", () => {
    // 24h + 61 min → excess rounds to 75 min = 5 quarters.
    const q = quote(24 * 60 + 61);
    const excessGross = Math.round((5 * RATE) / 4);
    expect(q!.excessMinutes).toBe(75);
    expect(q!.totalCents).toBe(24 * RATE + excessGross - Math.floor(excessGross / 10));
  });
});

describe("quoteReservation — validation", () => {
  it("returns null for inverted or empty ranges", () => {
    expect(quoteReservation({ startMs: BASE, endMs: BASE, hourlyRateCents: RATE })).toBeNull();
    expect(quoteReservation({ startMs: BASE + HOUR_MS, endMs: BASE, hourlyRateCents: RATE })).toBeNull();
  });

  it("returns null for non-integer or negative rates", () => {
    expect(quoteReservation({ startMs: BASE, endMs: BASE + HOUR_MS, hourlyRateCents: 32.5 })).toBeNull();
    expect(quoteReservation({ startMs: BASE, endMs: BASE + HOUR_MS, hourlyRateCents: -1 })).toBeNull();
  });
});
