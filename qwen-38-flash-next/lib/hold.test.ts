import { describe, expect, it } from "vitest";
import { effectiveStatus, HOLD_TTL_MS, holdRemainingMs } from "./hold";
import type { Reservation } from "./types";

const T0 = Date.UTC(2026, 0, 1, 12, 0, 0);

function held(over: Partial<Reservation> = {}): Reservation {
  return {
    id: "h1",
    listingId: "L1",
    start: T0 + 3_600_000,
    end: T0 + 4 * 3_600_000,
    status: "held",
    priceCents: 500,
    createdAt: T0,
    heldAt: T0,
    ...over,
  };
}

describe("hold expiry", () => {
  it("expires a hold strictly after 10 minutes", () => {
    expect(HOLD_TTL_MS).toBe(10 * 60 * 1000);
    expect(effectiveStatus(held(), T0 + 9 * 60_000)).toBe("held");
    expect(effectiveStatus(held(), T0 + 10 * 60_000 - 1)).toBe("held");
    expect(effectiveStatus(held(), T0 + 10 * 60_000 + 1)).toBe("expired");
  });

  it("treats the exact 10-minute boundary as still held (frees after)", () => {
    expect(effectiveStatus(held(), T0 + HOLD_TTL_MS)).toBe("held");
    expect(effectiveStatus(held(), T0 + HOLD_TTL_MS + 1)).toBe("expired");
  });

  it("does not expire confirmed or cancelled reservations", () => {
    expect(
      effectiveStatus(held({ status: "confirmed", confirmedAt: T0 }), T0 + 10 * 60 * 60_000),
    ).toBe("confirmed");
    expect(
      effectiveStatus(held({ status: "cancelled", cancelledAt: T0 }), T0 + 10 * 60 * 60_000),
    ).toBe("cancelled");
  });

  it("counts the hold down to zero", () => {
    expect(holdRemainingMs(held(), T0)).toBe(HOLD_TTL_MS);
    expect(holdRemainingMs(held(), T0 + 4 * 60_000)).toBe(6 * 60_000);
    expect(holdRemainingMs(held(), T0 + HOLD_TTL_MS + 5_000)).toBe(0);
    expect(holdRemainingMs(held({ status: "confirmed" }), T0)).toBe(0);
  });
});
