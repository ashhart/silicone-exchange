import { describe, expect, it } from "vitest";
import { canReserve, findConflicts, rangesOverlap } from "@/lib/overlap";
import { LISTING_BY_SLUG } from "@/data/listings";
import type { Reservation } from "@/data/types";
import { HOUR_MS } from "@/lib/time";

const T0 = Date.UTC(2026, 0, 1, 0, 0, 0);
const at = (h: number) => T0 + h * HOUR_MS;

function res(partial: Partial<Reservation> & { id: string }): Reservation {
  return {
    listingId: "h100-01-iad",
    startMs: at(0),
    endMs: at(1),
    status: "confirmed",
    createdAtMs: T0,
    ...partial,
  };
}

describe("rangesOverlap (half-open intervals)", () => {
  it("detects genuine overlaps", () => {
    expect(rangesOverlap(at(10), at(14), at(13), at(15))).toBe(true);
    expect(rangesOverlap(at(13), at(15), at(10), at(14))).toBe(true);
    expect(rangesOverlap(at(10), at(14), at(11), at(12))).toBe(true); // contained
    expect(rangesOverlap(at(10), at(14), at(10), at(14))).toBe(true); // identical
  });

  it("does not treat the 14:00 end / 14:00 start boundary as an overlap", () => {
    expect(rangesOverlap(at(10), at(14), at(14), at(18))).toBe(false);
    expect(rangesOverlap(at(14), at(18), at(10), at(14))).toBe(false);
  });

  it("treats fully disjoint ranges as non-overlapping", () => {
    expect(rangesOverlap(at(10), at(12), at(12), at(14))).toBe(false);
    expect(rangesOverlap(at(12), at(14), at(10), at(12))).toBe(false);
  });
});

describe("findConflicts", () => {
  it("ignores cancelled and expired reservations", () => {
    const list = [
      res({ id: "a", startMs: at(10), endMs: at(14), status: "cancelled" }),
      res({ id: "b", startMs: at(12), endMs: at(16), status: "expired" }),
    ];
    expect(findConflicts("h100-01-iad", at(11), at(13), list)).toEqual([]);
  });

  it("counts held reservations as occupying the slot", () => {
    const list = [res({ id: "a", startMs: at(10), endMs: at(14), status: "held" })];
    expect(findConflicts("h100-01-iad", at(12), at(15), list)).toHaveLength(1);
  });

  it("finds every conflicting reservation", () => {
    const list = [
      res({ id: "a", startMs: at(9), endMs: at(12) }),
      res({ id: "b", startMs: at(11), endMs: at(13) }),
      res({ id: "c", startMs: at(20), endMs: at(22) }),
    ];
    const conflicts = findConflicts("h100-01-iad", at(10), at(14), list);
    expect(conflicts.map((r) => r.id).sort()).toEqual(["a", "b"]);
  });

  it("ignores reservations on other listings entirely", () => {
    const list = [
      res({ id: "a", startMs: at(10), endMs: at(14) }),
      res({ id: "b", listingId: "h200-02-iad", startMs: at(10), endMs: at(14) }),
    ];
    const conflicts = findConflicts("h100-01-iad", at(11), at(13), list);
    expect(conflicts.map((r) => r.id)).toEqual(["a"]);
  });
});

describe("canReserve", () => {
  const listing = LISTING_BY_SLUG["h100-01-iad"]!;

  it("allows a free slot", () => {
    expect(canReserve(listing, at(20), at(22), []).ok).toBe(true);
  });

  it("rejects a slot that overlaps a confirmed reservation", () => {
    const list = [res({ id: "a", startMs: at(10), endMs: at(14) })];
    const check = canReserve(listing, at(13), at(15), list);
    expect(check.ok).toBe(false);
    expect(check.reason).toBe("overlap");
  });

  it("allows a booking that starts exactly when another ends", () => {
    const list = [res({ id: "a", startMs: at(10), endMs: at(14) })];
    expect(canReserve(listing, at(14), at(16), list).ok).toBe(true);
  });

  it("does not let another listing's reservation block this one", () => {
    const list = [res({ id: "a", listingId: "h200-02-iad", startMs: at(10), endMs: at(14) })];
    expect(canReserve(listing, at(11), at(13), list).ok).toBe(true);
  });

  it("ignores cancelled reservations when checking conflicts", () => {
    const list = [res({ id: "a", startMs: at(10), endMs: at(14), status: "cancelled" })];
    expect(canReserve(listing, at(12), at(15), list).ok).toBe(true);
  });

  it("blocks new reservations on a maintenance listing", () => {
    const maintenance = LISTING_BY_SLUG["a100-03-iad"]!;
    const check = canReserve(maintenance, at(20), at(22), []);
    expect(check.ok).toBe(false);
    expect(check.reason).toBe("maintenance");
  });

  it("blocks new reservations on a retired listing", () => {
    const retired = LISTING_BY_SLUG["rtx5090-04-pdx"]!;
    const check = canReserve(retired, at(20), at(22), []);
    expect(check.ok).toBe(false);
    expect(check.reason).toBe("retired");
  });

  it("rejects an inverted range", () => {
    const check = canReserve(listing, at(22), at(20), []);
    expect(check.ok).toBe(false);
    expect(check.reason).toBe("invalid-range");
  });
});
