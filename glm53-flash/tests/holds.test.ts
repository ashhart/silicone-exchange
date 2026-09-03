import { describe, expect, it } from "vitest";
import { isHoldExpired, effectiveStatus, blocksSlot, HOLD_DURATION_MS } from "@/lib/holds";
import type { Reservation } from "@/lib/types";

const CREATED = 1_000_000;
const DEADLINE = CREATED + HOLD_DURATION_MS;

function hold(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: "R1",
    listingId: "LST-001",
    startMs: CREATED + 3_600_000,
    endMs: CREATED + 7_200_000,
    status: "held",
    createdAtMs: CREATED,
    holdExpiresAtMs: DEADLINE,
    priceCents: 320,
    hourlyRateCents: 320,
    ...overrides,
  };
}

describe("hold expiry at the 10-minute boundary", () => {
  it("is still held at exactly 10 minutes", () => {
    expect(isHoldExpired(hold(), DEADLINE)).toBe(false);
    expect(effectiveStatus(hold(), DEADLINE)).toBe("held");
  });

  it("expires one millisecond past the deadline", () => {
    expect(isHoldExpired(hold(), DEADLINE + 1)).toBe(true);
    expect(effectiveStatus(hold(), DEADLINE + 1)).toBe("expired");
  });

  it("expires well past the deadline", () => {
    expect(isHoldExpired(hold(), DEADLINE + 60_000)).toBe(true);
  });

  it("never expires confirmed, cancelled or already-expired reservations", () => {
    expect(isHoldExpired(hold({ status: "confirmed" }), DEADLINE + 3_600_000)).toBe(false);
    expect(isHoldExpired(hold({ status: "cancelled" }), DEADLINE + 3_600_000)).toBe(false);
    expect(isHoldExpired(hold({ status: "expired" }), DEADLINE + 3_600_000)).toBe(false);
  });

  it("treats a hold with no deadline as non-expiring", () => {
    expect(isHoldExpired(hold({ holdExpiresAtMs: null }), DEADLINE + 3_600_000)).toBe(false);
  });

  it("expired holds stop blocking the slot; live holds keep blocking", () => {
    expect(blocksSlot(hold(), DEADLINE)).toBe(true);
    expect(blocksSlot(hold(), DEADLINE + 1)).toBe(false);
    expect(blocksSlot(hold({ status: "confirmed" }), DEADLINE + 3_600_000)).toBe(true);
    expect(blocksSlot(hold({ status: "cancelled" }), DEADLINE)).toBe(false);
  });
});
