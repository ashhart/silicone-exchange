"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LISTINGS } from "@/data/listings";
import { utilByListing } from "@/data/utilization";
import { REGIONS, type Region, type ListingStatus } from "@/lib/types";
import {
  applyFilters,
  DEFAULT_FILTERS,
  filterReducer,
  isDefaultFilters,
  parseFilters,
  writeFilters,
  type FilterAction,
  type FilterState,
  type SortKey,
} from "@/lib/filters";
import { cx } from "@/lib/cx";
import { ListingCard } from "./listing-card";
import { Reveal } from "./motion";

const SORT_LABELS: Record<SortKey, string> = {
  default: "Node ID",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
  "memory-desc": "Memory ↓",
  "tflops-desc": "TFLOPS ↓",
  "util-desc": "Utilization ↓",
};

const STATUS_OPTIONS: readonly ListingStatus[] = [
  "available",
  "maintenance",
  "retired",
];

function readQs(searchParams: URLSearchParams | null): string {
  return searchParams?.toString() ?? "";
}

export function BrowseClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const qs = readQs(searchParams);

  // Render state is authoritative for the current frame; the URL mirrors it.
  // When the URL changes underneath us (back/forward, deep link, refresh),
  // re-derive state during render — the sanctioned "adjusting state" pattern,
  // guarded so our own pushes never clobber mid-keystroke input.
  const [state, setState] = useState<FilterState>(() =>
    parseFilters(new URLSearchParams(qs)),
  );
  const [qDraft, setQDraft] = useState(state.q);
  const [adoptedQs, setAdoptedQs] = useState(qs);
  const [pushedQs, setPushedQs] = useState(qs);

  if (adoptedQs !== qs) {
    setAdoptedQs(qs);
    if (qs !== pushedQs) {
      const parsed = parseFilters(new URLSearchParams(qs));
      setState(parsed);
      setQDraft(parsed.q);
    }
  }

  const apply = useCallback(
    (next: FilterState) => {
      const out = writeFilters(next).toString();
      setPushedQs(out);
      setState(next);
      startTransition(() => {
        router.replace(out.length > 0 ? `/browse?${out}` : "/browse", {
          scroll: false,
        });
      });
    },
    [router],
  );

  const dispatch = useCallback(
    (action: FilterAction) => apply(filterReducer(state, action)),
    [apply, state],
  );

  const util = useMemo(() => utilByListing(), []);
  const results = useMemo(
    () => applyFilters(LISTINGS, state, util),
    [state, util],
  );
  const regionCounts = useMemo(() => {
    const counts: Partial<Record<Region, number>> = {};
    for (const l of LISTINGS) counts[l.region] = (counts[l.region] ?? 0) + 1;
    return counts;
  }, []);

  const dirty = !isDefaultFilters(state);
  const resetAll = () => {
    setQDraft("");
    apply(DEFAULT_FILTERS);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          The board
        </h1>
        <p className="mt-2 text-sm text-dim">
          Filter state lives in the URL — copy this link, refresh, or hit back
          and the board comes back exactly as configured.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <section
          aria-label="Filters"
          className="mt-8 grid gap-6 border border-hairline bg-panel p-4 md:p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="text-[10px] tracking-widest text-faint uppercase">
                Search
              </span>
              <input
                type="search"
                value={qDraft}
                onChange={(e) => {
                  setQDraft(e.target.value);
                  apply({ ...state, q: e.target.value });
                }}
                placeholder="chip, vendor, city, node id…"
                className="mt-1 w-full border border-hairline bg-bg px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-accent"
              />
            </label>
            <fieldset>
              <legend className="text-[10px] tracking-widest text-faint uppercase">
                Status
              </legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <Chip
                    key={s}
                    active={state.statuses.includes(s)}
                    onClick={() =>
                      dispatch({ type: "toggle-status", status: s })
                    }
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="space-y-4">
            <fieldset>
              <legend className="text-[10px] tracking-widest text-faint uppercase">
                Region
              </legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REGIONS.map((r) => (
                  <Chip
                    key={r}
                    active={state.regions.includes(r)}
                    onClick={() =>
                      dispatch({ type: "toggle-region", region: r })
                    }
                  >
                    {r}
                    <span className="ml-1 text-faint tabular-nums">
                      {regionCounts[r] ?? 0}
                    </span>
                  </Chip>
                ))}
              </div>
            </fieldset>
            <div className="flex items-end gap-2">
              <label className="block flex-1">
                <span className="text-[10px] tracking-widest text-faint uppercase">
                  Memory min GB
                </span>
                <input
                  inputMode="numeric"
                  value={state.memMinGb ?? ""}
                  onChange={(e) =>
                    dispatch({ type: "mem-min", gb: parseGb(e.target.value) })
                  }
                  placeholder="—"
                  className="mt-1 w-full border border-hairline bg-bg px-3 py-2 text-sm tabular-nums placeholder:text-faint focus:border-accent"
                />
              </label>
              <span className="pb-2.5 text-faint">—</span>
              <label className="block flex-1">
                <span className="text-[10px] tracking-widest text-faint uppercase">
                  Memory max GB
                </span>
                <input
                  inputMode="numeric"
                  value={state.memMaxGb ?? ""}
                  onChange={(e) =>
                    dispatch({ type: "mem-max", gb: parseGb(e.target.value) })
                  }
                  placeholder="—"
                  className="mt-1 w-full border border-hairline bg-bg px-3 py-2 text-sm tabular-nums placeholder:text-faint focus:border-accent"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-row items-end gap-2 md:flex-col md:items-stretch lg:w-44">
            <label className="block flex-1">
              <span className="text-[10px] tracking-widest text-faint uppercase">
                Sort by
              </span>
              <select
                value={state.sort}
                onChange={(e) =>
                  dispatch({ type: "sort", sort: e.target.value as SortKey })
                }
                className="mt-1 w-full border border-hairline bg-bg px-3 py-2 text-sm focus:border-accent"
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {SORT_LABELS[k]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!dirty}
              onClick={resetAll}
              className={cx(
                "w-full border px-3 py-2 text-[11px] tracking-[0.14em] uppercase transition-colors lg:mt-5",
                dirty
                  ? "border-accent text-accent hover:bg-accent hover:text-bg"
                  : "cursor-not-allowed border-hairline text-faint",
              )}
            >
              Reset filters
            </button>
          </div>
        </section>
      </Reveal>

      <div className="mt-6 flex items-baseline justify-between">
        <p aria-live="polite" className="text-xs text-dim tabular-nums">
          {results.length} / {LISTINGS.length} nodes
          {dirty ? " match filters" : " listed"}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="grid-bg mt-4 flex flex-col items-center gap-4 border border-dashed border-hairline-strong px-6 py-16 text-center">
          <p className="text-sm text-dim">
            <span className="text-accent">$</span> query returned 0 rows.
            Nothing matches this combination — widen the memory bounds or clear
            a region.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="border border-accent px-4 py-2 text-[11px] tracking-[0.14em] text-accent uppercase hover:bg-accent hover:text-bg"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l, i) => (
            <li key={l.id} className="h-full">
              <Reveal delay={Math.min(i * 0.03, 0.2)} className="h-full">
                <ListingCard listing={l} utilPct={util[l.id] ?? 0} />
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "border px-2 py-1 text-[10px] tracking-widest uppercase transition-colors",
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-hairline text-dim hover:border-accent/60 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** Digits-only parser for the memory inputs; anything else clears the bound. */
function parseGb(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
}
