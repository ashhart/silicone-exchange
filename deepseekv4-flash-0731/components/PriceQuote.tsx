import { computePrice } from "@/lib/pricing";
import { formatMinutes, formatMoney } from "@/lib/time";

interface PriceQuoteProps {
  startMs: number;
  endMs: number;
  hourlyRateCents: number;
}

export function PriceQuote({ startMs, endMs, hourlyRateCents }: PriceQuoteProps) {
  const p = computePrice(startMs, endMs, hourlyRateCents);
  if (p.totalCents === 0) return null;
  const hasDiscount = p.discountedBlocks > 0;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-sm font-semibold">Price quote</h3>
        <p className="font-mono text-2xl font-semibold text-accent">{formatMoney(p.totalCents)}</p>
      </div>
      <dl className="mt-3 space-y-1.5 font-mono text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Requested</dt>
          <dd>{formatMinutes(p.requestedMinutes)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Billable · 15-min, rounded up</dt>
          <dd>{formatMinutes(p.billableMinutes)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{hasDiscount ? "First 24h @ full rate" : "Full rate"}</dt>
          <dd>{formatMoney(p.baseCents)}</dd>
        </div>
        {hasDiscount && (
          <>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Excess hours @ 90%</dt>
              <dd>{formatMoney(p.discountedCents)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-ok">
              <dt>You save</dt>
              <dd>−{formatMoney(p.savingsCents)}</dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );
}
