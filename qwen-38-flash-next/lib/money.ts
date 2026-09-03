import { MINUTE_MS } from "./time";

/**
 * All money math lives here. Amounts are integer cents; durations are whole
 * minutes. Every division is an integer division with an explicit rounding
 * rule — no floating point ever touches an amount.
 *
 * Rules:
 *  - Billed in 15-minute increments, duration always rounded UP.
 *  - Minimum billable block is 1 hour.
 *  - Continuous time beyond hour 24 is billed 10% off — only the excess,
 *    never the first 24 hours.
 *  - Cent amounts from rate × time are rounded half-up to the nearest cent.
 */

export const BILLING_INCREMENT_MIN = 15;
export const MIN_BILLABLE_MIN = 60;
export const DISCOUNT_THRESHOLD_MIN = 24 * 60;
/** 10% off, in basis points. */
export const DISCOUNT_BPS = 1_000;

/** Integer division, rounded up. n >= 0, d > 0. */
function divRoundUp(n: number, d: number): number {
  return Math.floor((n + d - 1) / d);
}

/** Integer division, rounded half-up. n >= 0, d > 0. */
function divRoundNearest(n: number, d: number): number {
  return Math.floor((2 * n + d) / (2 * d));
}

/**
 * Minutes to bill for a [start, end) range: duration rounded up to whole
 * minutes, then up to the next 15-minute increment, then floored at 60.
 */
export function billableMinutes(start: number, end: number): number {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new RangeError("reservation end must be strictly after start");
  }
  const wholeMin = divRoundUp(end - start, MINUTE_MS);
  const increments = divRoundUp(wholeMin, BILLING_INCREMENT_MIN);
  return Math.max(increments * BILLING_INCREMENT_MIN, MIN_BILLABLE_MIN);
}

export interface Quote {
  billedMinutes: number;
  /** Portion billed at the full rate (first 24h). */
  baseMinutes: number;
  /** Portion billed at the discounted rate (beyond 24h). */
  excessMinutes: number;
  /** Extra billable minutes added by round-up + 1h minimum. */
  roundingMinutes: number;
  baseCents: number;
  /** What the excess would have cost at full rate. */
  grossExcessCents: number;
  /** Savings from the >24h discount (grossExcessCents - excessCents). */
  discountCents: number;
  /** Excess portion after the 10% discount. */
  excessCents: number;
  totalCents: number;
}

/** Quote for an already-rounded billable duration. */
export function quoteMinutes(
  priceCentsPerHour: number,
  billedMin: number,
): Quote {
  const base = Math.min(billedMin, DISCOUNT_THRESHOLD_MIN);
  const excess = billedMin - base;
  const baseCents = divRoundNearest(priceCentsPerHour * base, 60);
  const grossExcessCents = divRoundNearest(priceCentsPerHour * excess, 60);
  const excessCents = divRoundNearest(
    priceCentsPerHour * excess * (10_000 - DISCOUNT_BPS),
    60 * 10_000,
  );
  return {
    billedMinutes: billedMin,
    baseMinutes: base,
    excessMinutes: excess,
    roundingMinutes: 0,
    baseCents,
    grossExcessCents,
    discountCents: grossExcessCents - excessCents,
    excessCents,
    totalCents: baseCents + excessCents,
  };
}

/** Quote for a raw [start, end) range; applies the rounding rules first. */
export function quoteForRange(
  priceCentsPerHour: number,
  start: number,
  end: number,
): Quote {
  const billed = billableMinutes(start, end);
  const quote = quoteMinutes(priceCentsPerHour, billed);
  return {
    ...quote,
    roundingMinutes: billed - divRoundUp(end - start, MINUTE_MS),
  };
}
