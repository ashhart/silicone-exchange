import { QUARTER_HOUR_MS } from "./time";

/**
 * Pricing rules (all integer cents, never floating point):
 *
 * 1. Billed in 15-minute increments, always rounded UP.
 * 2. Minimum billable block is 1 hour.
 * 3. A booking longer than 24 continuous hours gets 10% off every hour
 *    beyond the 24th — the discount applies only to the excess, never to
 *    the whole booking. The discount is floored to the whole cent.
 *
 * Rates are quoted per hour in cents; a 15-minute increment is worth a
 * quarter of the hourly rate. Segment totals are computed once over the
 * whole segment and rounded to the nearest cent, so a full hour always
 * bills exactly the hourly rate.
 */

export const MIN_BILL_QUARTERS = 4;
export const DISCOUNT_THRESHOLD_QUARTERS = 96; // 24h in 15-minute units
export const DISCOUNT_DIVISOR = 10; // 10% off, floored to the whole cent

export type QuoteInput = {
  startMs: number;
  endMs: number;
  hourlyRateCents: number;
};

export type PriceQuote = {
  /** Requested duration, rounded up to the next whole minute. */
  rawMinutes: number;
  /** Billed duration after rounding and the 1-hour minimum. */
  billedMinutes: number;
  /** Minutes added by 15-minute round-up (before the minimum kicks in). */
  roundedUpMinutes: number;
  /** True when the 1-hour minimum billable block was applied. */
  minimumApplied: boolean;
  /** Price before the long-booking discount. */
  grossCents: number;
  /** Cents saved by the >24h discount (0 for bookings ≤ 24h). */
  discountCents: number;
  /** What the customer actually pays. */
  totalCents: number;
  /** Billed minutes beyond the 24th hour. */
  excessMinutes: number;
};

/** Returns null for an invalid range (end not after start) or a bad rate. */
export function quoteReservation({ startMs, endMs, hourlyRateCents }: QuoteInput): PriceQuote | null {
  const rawMs = endMs - startMs;
  if (!Number.isFinite(rawMs) || rawMs <= 0) return null;
  if (!Number.isInteger(hourlyRateCents) || hourlyRateCents < 0) return null;

  const rawMinutes = Math.ceil(rawMs / 60_000);
  let quarters = Math.ceil(rawMs / QUARTER_HOUR_MS);
  const roundedUpMinutes = quarters * 15 - rawMinutes;

  let minimumApplied = false;
  if (quarters < MIN_BILL_QUARTERS) {
    quarters = MIN_BILL_QUARTERS;
    minimumApplied = true;
  }

  const grossCents = costForQuarters(quarters, hourlyRateCents);
  const excessQuarters = Math.max(0, quarters - DISCOUNT_THRESHOLD_QUARTERS);
  const excessGrossCents = costForQuarters(excessQuarters, hourlyRateCents);
  const discountCents = Math.floor(excessGrossCents / DISCOUNT_DIVISOR);

  return {
    rawMinutes,
    billedMinutes: quarters * 15,
    roundedUpMinutes,
    minimumApplied,
    grossCents,
    discountCents,
    totalCents: grossCents - discountCents,
    excessMinutes: excessQuarters * 15,
  };
}

function costForQuarters(quarters: number, hourlyRateCents: number): number {
  if (quarters === 0) return 0;
  return Math.round((quarters * hourlyRateCents) / 4);
}
