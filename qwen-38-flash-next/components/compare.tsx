"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LISTINGS } from "@/data/listings";
import { avgUtil24h } from "@/data/utilization";
import type { Listing } from "@/lib/types";
import { percentOfBps, usd } from "@/lib/format";
import { useHydrated } from "@/lib/hooks";
import { cx } from "@/lib/cx";
import { MAX_COMPARE, useCompareStore } from "@/store/compare";
import { ListingStatusBadge } from "./ui";

type Direction = "max" | "min";

interface Row {
  label: string;
  get: (l: Listing) => number;
  fmt: (l: Listing) => string;
  best?: Direction;
}

const ROWS: Row[] = [
  { label: "Status", get: () => 0, fmt: (l) => l.status },
  { label: "Chip", get: () => 0, fmt: (l) => l.chip },
  { label: "Vendor / city", get: () => 0, fmt: (l) => `${l.vendor} · ${l.city}` },
  { label: "Memory", get: (l) => l.memoryGb, fmt: (l) => `${l.memoryGb} GB`, best: "max" },
  {
    label: "Compute (FP16 dense)",
    get: (l) => l.tflops,
    fmt: (l) => `${l.tflops.toLocaleString("en-US")} TFLOPS`,
    best: "max",
  },
  {
    label: "Price / GPU-h",
    get: (l) => l.priceCentsPerHour,
    fmt: (l) => usd(l.priceCentsPerHour),
    best: "min",
  },
  {
    label: "Utilization (24h)",
    get: (l) => avgUtil24h(l.id),
    fmt: (l) => `${avgUtil24h(l.id)}%`,
  },
  { label: "Uptime", get: (l) => l.uptimeBps, fmt: (l) => percentOfBps(l.uptimeBps), best: "max" },
  { label: "Units", get: (l) => l.units, fmt: (l) => String(l.units), best: "max" },
  { label: "Power limit", get: (l) => l.powerLimitWatts, fmt: (l) => `${l.powerLimitWatts} W` },
  { label: "Interconnect", get: () => 0, fmt: (l) => l.interconnect },
];

export function CompareClient() {
  const hydrated = useHydrated();
  const ids = useCompareStore((s) => s.ids);
  const toggle = useCompareStore((s) => s.toggle);
  const clear = useCompareStore((s) => s.clear);
  const [pickerQuery, setPickerQuery] = useState("");

  const selected = useMemo(
    () =>
      ids
        .map((id) => LISTINGS.find((l) => l.id === id))
        .filter((l): l is Listing => l !== undefined),
    [ids],
  );

  const bestByRow = useMemo(() => {
    const out = new Map<string, number>();
    for (const row of ROWS) {
      if (!row.best || selected.length < 2) continue;
      const values = selected.map(row.get);
      out.set(
        row.label,
        row.best === "max" ? Math.max(...values) : Math.min(...values),
      );
    }
    return out;
  }, [selected]);

  const pickerList = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return LISTINGS.filter((l) =>
      q.length === 0
        ? true
        : `${l.id} ${l.chip} ${l.vendor} ${l.city} ${l.region}`
            .toLowerCase()
            .includes(q),
    );
  }, [pickerQuery]);

  const full = ids.length >= MAX_COMPARE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Compare
          </h1>
          <p className="mt-2 text-sm text-dim">
            Pick up to {MAX_COMPARE} nodes — selection persists across every
            page and reload.
          </p>
        </div>
        {hydrated && selected.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="border border-hairline px-3 py-1.5 text-[11px] tracking-[0.14em] text-dim uppercase hover:border-bad hover:text-bad"
          >
            Clear selection
          </button>
        ) : null}
      </div>

      {hydrated ? (
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <aside aria-label="Pick listings to compare">
          <label>
            <span className="text-[10px] tracking-widest text-faint uppercase">
              Filter nodes
            </span>
            <input
              type="search"
              value={pickerQuery}
              onChange={(e) => setPickerQuery(e.target.value)}
              placeholder="chip, vendor, city…"
              className="mt-1 w-full border border-hairline bg-panel px-3 py-2 text-sm placeholder:text-faint focus:border-accent"
            />
          </label>
          <ul className="mt-3 max-h-[420px] divide-y divide-hairline overflow-auto border border-hairline bg-panel">
            {pickerList.map((l) => {
              const on = ids.includes(l.id);
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={!on && full}
                    onClick={() => toggle(l.id)}
                    className={cx(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors",
                      on
                        ? "bg-accent/10 text-accent"
                        : "text-dim hover:bg-raised hover:text-ink",
                      !on && full && "cursor-not-allowed opacity-40",
                    )}
                  >
                    <span className="truncate">
                      <span className="text-faint tabular-nums">{l.id}</span>{" "}
                      {l.chip} · {l.city}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {usd(l.priceCentsPerHour)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="min-w-0">
          {selected.length === 0 ? (
            <div className="grid-bg flex h-full flex-col items-center justify-center gap-3 border border-dashed border-hairline-strong px-6 py-16 text-center">
              <p className="text-sm text-dim">
                Nothing selected yet. Pick{" "}
                <span className="text-accent">one to three</span> nodes from
                the list, or hit <span className="text-ink">compare +</span> on
                any card in <Link href="/browse" className="text-accent underline">Browse</Link>.
              </p>
            </div>
          ) : (
            <>
              {/* Diff table on wide screens */}
              <div className="hidden overflow-x-auto border border-hairline bg-panel md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-hairline">
                      <th className="px-4 py-3 text-[10px] tracking-widest text-faint uppercase">
                        spec
                      </th>
                      {selected.map((l) => (
                        <th key={l.id} className="px-4 py-3 text-left">
                          <Link
                            href={`/listings/${l.slug}`}
                            className="font-display text-sm font-semibold text-ink hover:text-accent"
                          >
                            {l.id} · {l.chip}
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggle(l.id)}
                            aria-label={`Remove ${l.id} from comparison`}
                            className="mt-1 block text-[10px] tracking-widest text-faint uppercase hover:text-bad"
                          >
                            remove ×
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((row) => {
                      const best = bestByRow.get(row.label);
                      return (
                        <tr key={row.label} className="border-b border-hairline last:border-b-0">
                          <th
                            scope="row"
                            className="px-4 py-2.5 text-left text-[10px] font-normal tracking-widest text-faint uppercase"
                          >
                            {row.label}
                          </th>
                          {selected.map((l) => {
                            const isBest =
                              row.best !== undefined &&
                              best !== undefined &&
                              row.get(l) === best;
                            return (
                              <td
                                key={l.id}
                                className={cx(
                                  "px-4 py-2.5 tabular-nums",
                                  isBest ? "font-semibold text-accent" : "text-ink",
                                )}
                              >
                                {row.fmt(l)}
                                {isBest ? (
                                  <span className="ml-1.5 text-[9px] tracking-widest text-accent uppercase">
                                    best
                                  </span>
                                ) : null}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cards on mobile */}
              <ul className="space-y-4 md:hidden">
                {selected.map((l) => (
                  <li key={l.id} className="border border-hairline bg-panel p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/listings/${l.slug}`}
                          className="font-display font-semibold text-ink hover:text-accent"
                        >
                          {l.id} · {l.chip}
                        </Link>
                        <div className="mt-1">
                          <ListingStatusBadge status={l.status} />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(l.id)}
                        aria-label={`Remove ${l.id} from comparison`}
                        className="text-[10px] tracking-widest text-faint uppercase hover:text-bad"
                      >
                        remove ×
                      </button>
                    </div>
                    <dl className="mt-3 text-xs">
                      {ROWS.filter((r) => r.label !== "Status").map((row) => (
                        <div
                          key={row.label}
                          className="flex items-baseline justify-between gap-3 border-b border-hairline py-1.5 last:border-b-0"
                        >
                          <dt className="text-faint">{row.label}</dt>
                          <dd
                            className={cx(
                              "text-right tabular-nums",
                              row.best &&
                                bestByRow.get(row.label) === row.get(l)
                                ? "font-semibold text-accent"
                                : "text-ink",
                            )}
                          >
                            {row.fmt(l)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      ) : (
        <div className="mt-8 h-72 animate-pulse border border-hairline bg-panel" />
      )}
    </div>
  );
}
