import { describe, expect, it } from "vitest";
import { hasBlockingConflict } from "@/lib/reservations";
import type { Reservation } from "@/lib/types";

const NOW = 1_750_000_000_000;
const H = 3_600_000;
const DAY = 24 * H;

function res(overrides: Partial<Reservation>): Reservation {
  return {
    id: "R",
    listingId: "LST-001",
    startMs: NOW + 8 * H,
    endMs: NOW + 20 * H,
    status: "confirmed",
    createdAtMs: NOW - DAY,
    holdExpiresAtMs: null,
    priceCents: 3840,
    hourlyRateCents: 320,
    ...overrides,
  };
}

describe("hasBlockingConflict", () => {
  it("rejects a 06:00–10:00 candidate against an 08:00–20:00 block (naive start-inside check would pass it)", () => {
    const existing = [res({})];
    expect(hasBlockingConflict("LST-001", { startMs: NOW + 6 * H, endMs: NOW + 10 * H }, existing, NOW)).toBe(true);
  });

  it("allows a booking that starts exactly when an existing one ends (half-open boundary)", () => {
    const existing = [res({ startMs: NOW + 8 * H, endMs: NOW + 14 * H })];
    expect(hasBlockingConflict("LST-001", { startMs: NOW + 14 * H, endMs: NOW + 18 * H }, existing, NOW)).toBe(false);
  });

  it("ignores cancelled reservations", () => {
    const existing = [res({ status: "cancelled" })];
    expect(hasBlockingConflict("LST-001", { startMs: NOW + 9 * H, endMs: NOW + 11 * H }, existing, NOW)).toBe(false);
  });

  it("ignores expired holds but not live ones", () => {
    const expired = res({ status: "held", holdExpiresAtMs: NOW - 1 });
    const live = res({ id: "R2", status: "held", holdExpiresAtMs: NOW + 60_000 });
    expect(hasBlockingConflict("LST-001", { startMs: NOW + 9 * H, endMs: NOW + 11 * H }, [expired], NOW)).toBe(false);
    expect(hasBlockingConflict("LST-001", { startMs: NOW + 9 * H, endMs: NOW + 11 * H }, [live], NOW)).toBe(true);
  });

  it("only considers the same listing", () => {
    const existing = [res({ listingId: "LST-002" })];
    expect(hasBlockingConflict("LST-001", { startMs: NOW + 9 * H, endMs: NOW + 11 * H }, existing, NOW)).toBe(false);
  });
});
