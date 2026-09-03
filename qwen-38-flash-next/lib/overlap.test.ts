import { describe, expect, it } from "vitest";
import { canReserve, findConflict, rangesOverlap } from "./overlap";
import type { Listing, Reservation } from "./types";

const HOUR = 3_600_000;
const T0 = Date.UTC(2026, 0, 1, 0, 0, 0);
const NOW = T0 + 5 * HOUR;

function res(over: Partial<Reservation> = {}): Reservation {
  return {
    id: "r1",
    listingId: "L1",
    start: T0 + 9 * HOUR,
    end: T0 + 14 * HOUR,
    status: "confirmed",
    priceCents: 100,
    createdAt: T0,
    heldAt: T0,
    ...over,
  };
}

const listing = (status: Listing["status"] = "available"): Listing =>
  ({ id: "L1", status, priceCentsPerHour: 100 }) as Listing;

describe("rangesOverlap (half-open)", () => {
  it("does NOT overlap on a shared boundary: 14:00 end vs 14:00 start", () => {
    expect(
      rangesOverlap(T0 + 9 * HOUR, T0 + 14 * HOUR, T0 + 14 * HOUR, T0 + 17 * HOUR),
    ).toBe(false);
    // and the mirrored direction
    expect(
      rangesOverlap(T0 + 14 * HOUR, T0 + 17 * HOUR, T0 + 9 * HOUR, T0 + 14 * HOUR),
    ).toBe(false);
  });

  it("would flag that same case under the naive <= check", () => {
    const aS = T0 + 9 * HOUR, aE = T0 + 14 * HOUR;
    const bS = T0 + 14 * HOUR, bE = T0 + 17 * HOUR;
    const naive = aS <= bE && bS <= aE;
    expect(naive).toBe(true); // what the half-open rule protects against
  });

  it("overlaps on any real interior intersection", () => {
    expect(
      rangesOverlap(T0 + 9 * HOUR, T0 + 14 * HOUR, T0 + 13 * HOUR + 59 * 60_000, T0 + 17 * HOUR),
    ).toBe(true);
    expect(
      rangesOverlap(T0 + 9 * HOUR, T0 + 14 * HOUR, T0 + 13 * HOUR, T0 + 14 * HOUR),
    ).toBe(true); // b nested at end
    expect(
      rangesOverlap(T0 + 9 * HOUR, T0 + 14 * HOUR, T0 + 10 * HOUR, T0 + 12 * HOUR),
    ).toBe(true); // b inside a
    expect(
      rangesOverlap(T0 + 10 * HOUR, T0 + 12 * HOUR, T0 + 9 * HOUR, T0 + 14 * HOUR),
    ).toBe(true); // a inside b
  });

  it("separates ranges with a gap", () => {
    expect(
      rangesOverlap(T0 + 9 * HOUR, T0 + 10 * HOUR, T0 + 11 * HOUR, T0 + 12 * HOUR),
    ).toBe(false);
  });
});

describe("findConflict", () => {
  it("ignores cancelled reservations", () => {
    const list = [res({ status: "cancelled" })];
    expect(findConflict(list, { listingId: "L1", start: T0 + 10 * HOUR, end: T0 + 12 * HOUR }, NOW)).toBeNull();
  });

  it("ignores expired holds but respects live ones", () => {
    const expiredHold = [res({ status: "held", heldAt: NOW - 10 * 60_000 - 1 })];
    expect(findConflict(expiredHold, { listingId: "L1", start: T0 + 10 * HOUR, end: T0 + 12 * HOUR }, NOW)).toBeNull();
    const liveHold = [res({ status: "held", heldAt: NOW - 10 * 60_000 })];
    expect(
      findConflict(liveHold, { listingId: "L1", start: T0 + 10 * HOUR, end: T0 + 12 * HOUR }, NOW)?.id,
    ).toBe("r1");
  });

  it("lets a booking start exactly when another ends", () => {
    const list = [res()]; // 09:00-14:00
    expect(
      findConflict(list, { listingId: "L1", start: T0 + 14 * HOUR, end: T0 + 17 * HOUR }, NOW),
    ).toBeNull();
  });

  it("only conflicts within the same listing", () => {
    const list = [res()];
    expect(
      findConflict(list, { listingId: "L2", start: T0 + 9 * HOUR, end: T0 + 14 * HOUR }, NOW),
    ).toBeNull();
  });
});

describe("canReserve", () => {
  it("blocks new reservations on maintenance listings", () => {
    expect(canReserve(listing("maintenance"), [], T0 + 9 * HOUR, T0 + 12 * HOUR, NOW)).toEqual({
      ok: false,
      reason: "maintenance",
    });
  });

  it("blocks new reservations on retired listings", () => {
    expect(canReserve(listing("retired"), [], T0 + 9 * HOUR, T0 + 12 * HOUR, NOW)).toEqual({
      ok: false,
      reason: "retired",
    });
  });

  it("rejects empty or inverted ranges", () => {
    expect(canReserve(listing(), [], T0 + 5 * HOUR, T0 + 5 * HOUR, NOW)).toEqual({
      ok: false,
      reason: "invalid-range",
    });
  });

  it("returns the conflicting reservation", () => {
    const verdict = canReserve(listing(), [res()], T0 + 13 * HOUR, T0 + 15 * HOUR, NOW);
    expect(verdict.ok).toBe(false);
    if (!verdict.ok && verdict.reason === "conflict") {
      expect(verdict.conflict.id).toBe("r1");
    }
  });

  it("allows a clean booking", () => {
    expect(canReserve(listing(), [res()], T0 + 14 * HOUR, T0 + 18 * HOUR, NOW)).toEqual({ ok: true });
  });
});
