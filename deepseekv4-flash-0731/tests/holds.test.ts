import { describe, expect, it } from "vitest";
import { expireOverdueHolds, holdExpired, msRemainingInHold } from "@/lib/holds";
import { HOLD_MS, MINUTE_MS } from "@/lib/time";
import type { Reservation } from "@/data/types";

const T0 = Date.UTC(2026, 0, 1, 0, 0, 0);

function held(overrides: Partial<Reservation> = {}): Reservation {
  return {
    id: "r1",
    listingId: "h100-01-iad",
    startMs: T0 + 2 * 3_600_000,
    endMs: T0 + 3 * 3_600_000,
    status: "held",
    createdAtMs: T0,
    heldUntilMs: T0 + HOLD_MS,
    ...overrides,
  };
}

describe("hold expiry", () => {
  it("expires a hold exactly at the 10-minute boundary", () => {
    const r = held();
    expect(holdExpired(r, T0 + HOLD_MS)).toBe(true);
    expect(holdExpired(r, T0 + HOLD_MS + 1)).toBe(true);
  });

  it("does not expire a hold before the 10-minute boundary", () => {
    const r = held();
    expect(holdExpired(r, T0 + HOLD_MS - 1)).toBe(false);
    expect(holdExpired(r, T0)).toBe(false);
  });

  it("reports remaining hold time and clamps at zero", () => {
    const r = held();
    expect(msRemainingInHold(r, T0 + 4 * MINUTE_MS)).toBe(HOLD_MS - 4 * MINUTE_MS);
    expect(msRemainingInHold(r, T0 + 99 * MINUTE_MS)).toBe(0);
  });

  it("reports zero remaining for non-held reservations", () => {
    const confirmed = held({ status: "confirmed", heldUntilMs: undefined });
    const expired = held({ status: "expired", heldUntilMs: undefined });
    expect(msRemainingInHold(confirmed, T0)).toBe(0);
    expect(msRemainingInHold(expired, T0)).toBe(0);
  });

  it("flips only overdue held reservations to expired", () => {
    const overdue = held({ id: "overdue", heldUntilMs: T0 + HOLD_MS });
    const fresh = held({ id: "fresh", heldUntilMs: T0 + HOLD_MS + 5 * MINUTE_MS });
    const confirmed = held({ id: "confirmed", status: "confirmed", heldUntilMs: undefined });
    const cancelled = held({ id: "cancelled", status: "cancelled", heldUntilMs: undefined });

    const result = expireOverdueHolds([overdue, fresh, confirmed, cancelled], T0 + HOLD_MS);

    expect(result.find((r) => r.id === "overdue")?.status).toBe("expired");
    expect(result.find((r) => r.id === "overdue")?.heldUntilMs).toBeUndefined();
    expect(result.find((r) => r.id === "fresh")?.status).toBe("held");
    expect(result.find((r) => r.id === "confirmed")?.status).toBe("confirmed");
    expect(result.find((r) => r.id === "cancelled")?.status).toBe("cancelled");
  });

  it("leaves the input array untouched", () => {
    const overdue = held();
    const input = [overdue];
    expireOverdueHolds(input, T0 + HOLD_MS);
    expect(input[0]?.status).toBe("held");
  });
});
