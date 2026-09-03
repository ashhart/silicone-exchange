"use client";

import Link from "next/link";
import { useMounted } from "@/lib/useMounted";
import { MAX_COMPARE, useCompare } from "@/store/useCompare";
import { LISTING_BY_SLUG } from "@/data/listings";
import { CHIP_BY_ID } from "@/data/chips";
import { REGION_BY_ID } from "@/data/regions";
import { formatMoney } from "@/lib/time";
import { EmptyState } from "@/components/EmptyState";

interface SpecRow {
  label: string;
  value: string;
  best?: boolean;
}

function specRows(listingId: string, best: { memory: number; tflops: number; rate: number }): SpecRow[] {
  const listing = LISTING_BY_SLUG[listingId]!;
  const chip = CHIP_BY_ID[listing.chipId]!;
  const region = REGION_BY_ID[listing.regionId];
  return [
    { label: "Accelerator", value: chip.name },
    { label: "Vendor", value: chip.vendor },
    { label: "VRAM", value: `${listing.memoryGB} GB ${chip.vramType}`, best: listing.memoryGB === best.memory },
    { label: "Compute", value: `${listing.tflops.toLocaleString("en-US")} TFLOPS`, best: listing.tflops === best.tflops },
    { label: "Power", value: `${chip.powerW} W` },
    { label: "Interconnect", value: chip.interconnect },
    { label: "Region", value: `${region?.label} (${region?.code})` },
    { label: "Rate", value: `${formatMoney(listing.hourlyRateCents)}/hr`, best: listing.hourlyRateCents === best.rate },
    { label: "Status", value: listing.status },
    { label: "Rack", value: listing.rack },
  ];
}

export default function ComparePage() {
  const mounted = useMounted();
  const ids = useCompare((s) => s.ids);
  const remove = useCompare((s) => s.toggle);
  const clear = useCompare((s) => s.clear);

  if (!mounted) {
    return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">Loading…</div>;
  }

  const listings = ids.map((id) => LISTING_BY_SLUG[id]).filter((l) => l !== undefined);

  const best = {
    memory: Math.max(...listings.map((l) => l.memoryGB), 0),
    tflops: Math.max(...listings.map((l) => l.tflops), 0),
    rate: Math.min(...listings.map((l) => l.hourlyRateCents), Number.MAX_SAFE_INTEGER),
  };

  const rows = listings.length > 0 ? specRows(listings[0]!.id, best) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Compare nodes</h1>
          <p className="mt-1 text-sm text-muted">
            Up to {MAX_COMPARE} accelerators, side by side. Selection persists across pages.
          </p>
        </div>
        {listings.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="font-mono text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {listings.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Nothing to compare yet"
            body={`Pick up to ${MAX_COMPARE} nodes from the browse grid or any listing page and they will line up here.`}
            action={
              <Link
                href="/browse"
                className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accentink transition-opacity hover:opacity-90"
              >
                Browse compute
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-8 hidden overflow-hidden rounded-xl border border-line bg-surface sm:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="w-40 px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-muted">
                    Spec
                  </th>
                  {listings.map((l) => (
                    <th key={l.id} scope="col" className="border-l border-line px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/listings/${l.slug}`} className="font-display text-sm font-semibold hover:text-accent">
                            {l.name}
                          </Link>
                          <p className="mt-0.5 font-mono text-[11px] text-faint">{l.hostname}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(l.id)}
                          aria-label={`Remove ${l.name} from compare`}
                          className="rounded p-1 text-faint transition-colors hover:text-danger"
                        >
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                            <path d="M4 4l8 8M12 4l-8 8" />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 1 ? "bg-surface2/50" : undefined}>
                    <th scope="row" className="px-4 py-2.5 font-mono text-xs font-medium text-muted">
                      {row.label}
                    </th>
                    {listings.map((l) => {
                      const cell = specRows(l.id, best).find((r) => r.label === row.label);
                      return (
                        <td key={l.id} className={`border-l border-line px-4 py-2.5 font-mono text-xs ${cell?.best ? "font-semibold text-accent" : "text-ink"}`}>
                          {cell?.value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-line px-4 py-2 font-mono text-[11px] text-faint">
              Accent marks the best value per row.
            </p>
          </div>

          {/* Mobile cards */}
          <div className="mt-8 grid gap-4 sm:hidden">
            {listings.map((l) => (
              <div key={l.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/listings/${l.slug}`} className="font-display text-sm font-semibold hover:text-accent">
                      {l.name}
                    </Link>
                    <p className="mt-0.5 font-mono text-[11px] text-faint">{l.hostname}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    aria-label={`Remove ${l.name} from compare`}
                    className="rounded p-1 text-faint transition-colors hover:text-danger"
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
                <dl className="mt-3 space-y-1.5">
                  {specRows(l.id, best).map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-4 font-mono text-xs">
                      <dt className="text-muted">{row.label}</dt>
                      <dd className={`text-right ${row.best ? "font-semibold text-accent" : "text-ink"}`}>
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
