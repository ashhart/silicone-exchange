import { MINUTE_MS } from "./time";

export const BILLING_BLOCK_MINUTES = 15;
export const MIN_BILLABLE_MINUTES = 60;
export const FULL_RATE_HOURS = 24;
export const EXCESS_DISCOUNT_PERCENT = 10;
export const BLOCKS_PER_HOUR = 60 / BILLING_BLOCK_MINUTES; // 4
export const FULL_RATE_BLOCKS = FULL_RATE_HOURS * BLOCKS_PER_HOUR; // 96

export interface PriceBreakdown {
  requestedMinutes: number;
  billableBlocks: number;
  billableMinutes: number;
  fullRateBlocks: number;
  discountedBlocks: number;
  baseCents: number;
  discountedCents: number;
  savingsCents: number;
  totalCents: number;
}

/** ceil(a / b) for non-negative integers — no floating point. */
function ceilDiv(a: number, b: number): number {
  return Math.floor((a + b - 1) / b);
}

/**
 * Price a reservation in integer cents.
 *
 * Rules:
 *  - Billed in 15-minute blocks, always rounded up.
 *  - Minimum billable block is 1 hour.
 *  - Anything past 24 continuous hours bills at 90% — only the excess hours
 *    are discounted, never the first 24.
 *  - Money is integer cents throughout; the per-block rate is
 *    rateCents / 4 and the total is rounded up to a whole cent.
 */
export function computePrice(startMs: number, endMs: number, hourlyRateCents: number): PriceBreakdown {
  const requestedMinutes = Math.max(0, Math.floor((endMs - startMs) / MINUTE_MS));

  if (requestedMinutes <= 0) {
    return {
      requestedMinutes: 0,
      billableBlocks: 0,
      billableMinutes: 0,
      fullRateBlocks: 0,
      discountedBlocks: 0,
      baseCents: 0,
      discountedCents: 0,
      savingsCents: 0,
      totalCents: 0,
    };
  }

  const rawBlocks = ceilDiv(requestedMinutes, BILLING_BLOCK_MINUTES);
  const billableBlocks = Math.max(rawBlocks, ceilDiv(MIN_BILLABLE_MINUTES, BILLING_BLOCK_MINUTES));
  const fullRateBlocks = Math.min(billableBlocks, FULL_RATE_BLOCKS);
  const discountedBlocks = billableBlocks - fullRateBlocks;

  const baseCents = ceilDiv(hourlyRateCents * fullRateBlocks, BLOCKS_PER_HOUR);
  const discountedCents = ceilDiv(
    hourlyRateCents * discountedBlocks * (100 - EXCESS_DISCOUNT_PERCENT),
    BLOCKS_PER_HOUR * 100,
  );
  const fullPriceDiscounted = ceilDiv(hourlyRateCents * discountedBlocks, BLOCKS_PER_HOUR);
  const savingsCents = fullPriceDiscounted - discountedCents;
  const totalCents = baseCents + discountedCents;

  return {
    requestedMinutes,
    billableBlocks,
    billableMinutes: billableBlocks * BILLING_BLOCK_MINUTES,
    fullRateBlocks,
    discountedBlocks,
    baseCents,
    discountedCents,
    savingsCents,
    totalCents,
  };
}
