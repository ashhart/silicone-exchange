"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LISTINGS } from "@/data/listings";
import { REGIONS } from "@/data/regions";
import { utilizationMap } from "@/data/utilization";
import {
  applyFilters,
  filtersReducer,
  parseFilters,
  serializeFilters,
  DEFAULT_FILTERS,
  SORT_KEYS,
  STATUS_FILTERS,
  type FilterState,
  type SortKey,
  type StatusFilter,
} from "@/lib/filters";
import { LISTING_SORT_LABEL, STATUS_FILTER_LABEL } from "@/lib/labels";
import { useReservationClock } from "@/lib/useReservationClock";
import { ListingCard } from "@/components/ListingCard";

const SORT_OPTIONS: SortKey[] = [...SORT_KEYS];
const STATUS_OPTIONS: StatusFilter[] = [...STATUS_FILTERS];

export function BrowseClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from the URL once on the client; keep a stable object identity.
  const [filters, dispatch] = useReducer(filtersReducer, DEFAULT_FILTERS);
  const [synced, setSynced] = useState(false);

  // Pull the initial filter state out of the URL. Deferred to a task so the
  // dispatches happen in a callback, not synchronously inside the effect.
  useEffect(() => {
    const timer = setTimeout(() => {
      const fromUrl = parseFilters(new URLSearchParams(window.location.search));
      dispatch({ type: "reset" });
      for (const action of diffToActions(DEFAULT_FILTERS, fromUrl)) dispatch(action);
      setSynced(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // URL is the source of truth: every filter change rewrites the query string.
  useEffect(() => {
    if (!synced) return;
    const qs = serializeFilters(filters);
    const current = serializeFilters(parseFilters(new URLSearchParams(window.location.search)));
    if (qs !== current) {
      router.replace(qs.length > 0 ? `/browse?${qs}` : "/browse", { scroll: false });
    }
  }, [filters, synced, router]);

  // Back/forward buttons re-parse the URL into filter state.
  useEffect(() => {
    if (!synced) return;
    const timer = setTimeout(() => {
      const fromUrl = parseFilters(new URLSearchParams(searchParams.toString()));
      dispatch({ type: "reset" });
      for (const action of diffToActions(DEFAULT_FILTERS, fromUrl)) dispatch(action);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams, synced]);

  const now = useReservationClock(60_000);
  const utilization = useMemo(
    () => (now === 0 ? new Map<string, number>() : utilizationMap(LISTINGS, now)),
    [now],
  );
  const results = useMemo(() => applyFilters(LISTINGS, filters, utilization), [filters, utilization]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-700 text-ink">Browse capacity</h1>
          <p className="mt-1 text-[13px] text-muted">
            {results.length} of {LISTINGS.length} units · filters live in the URL
          </p>
        </div>
        <SortSelect value={filters.sort} onChange={(sort) => dispatch({ type: "setSort", sort })} />
      </header>

      <FilterBar filters={filters} dispatch={dispatch} />

      {results.length === 0 ? (
        <EmptyState onReset={() => dispatch({ type: "reset" })} />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((listing, i) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              utilizationPct={utilization.get(listing.id) ?? 0}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBar({
  filters,
  dispatch,
}: {
  filters: FilterState;
  dispatch: React.Dispatch<Parameters<typeof filtersReducer>[1]>;
}) {
  return (
    <div className="mt-6 grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-faint">Search</span>
        <input
          type="search"
          value={filters.q}
          onChange={(e) => dispatch({ type: "setQuery", q: e.target.value })}
          placeholder="Chip, vendor, site…"
          className="w-full rounded-md border border-line bg-bg px-3 py-2 text-[13px] text-ink placeholder:text-faint"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-faint">Region</span>
        <select
          value={filters.region}
          onChange={(e) => dispatch({ type: "setRegion", region: e.target.value })}
          className="w-full rounded-md border border-line bg-bg px-3 py-2 text-[13px] text-ink"
        >
          <option value="all">All regions</option>
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="block">
        <legend className="mb-1 text-[11px] uppercase tracking-[0.1em] text-faint">Memory (GB)</legend>
        <div className="flex items-center gap-2">
          <MemoryInput
            ariaLabel="Minimum memory in gigabytes"
            value={filters.memMin}
            onCommit={(min) => dispatch({ type: "setMemory", min, max: filters.memMax })}
          />
          <span className="text-faint">–</span>
          <MemoryInput
            ariaLabel="Maximum memory in gigabytes"
            value={filters.memMax}
            onCommit={(max) => dispatch({ type: "setMemory", min: filters.memMin, max })}
          />
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-[11px] uppercase tracking-[0.1em] text-faint">Status</span>
        <select
          value={filters.status}
          onChange={(e) => dispatch({ type: "setStatus", status: e.target.value as StatusFilter })}
          className="w-full rounded-md border border-line bg-bg px-3 py-2 text-[13px] text-ink"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_FILTER_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

/**
 * Fully controlled numeric input: every change parses and commits straight
 * into the filter state, so there is no local mirror to keep in sync.
 */
function MemoryInput({
  value,
  onCommit,
  ariaLabel,
}: {
  value: number | null;
  onCommit: (v: number | null) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      aria-label={ariaLabel}
      value={value === null ? "" : String(value)}
      onChange={(e) => {
        const trimmed = e.target.value.trim();
        if (trimmed.length === 0) return onCommit(null);
        const n = Number(trimmed);
        if (Number.isFinite(n) && n >= 0) onCommit(Math.floor(n));
      }}
      placeholder="any"
      className="num w-full rounded-md border border-line bg-bg px-2 py-2 text-[13px] text-ink placeholder:text-faint"
    />
  );
}

function SortSelect({ value, onChange }: { value: SortKey; onChange: (s: SortKey) => void }) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-muted">
      Sort
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink"
      >
        {SORT_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {LISTING_SORT_LABEL[s]}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-16 flex flex-col items-center rounded-lg border border-dashed border-line-strong py-20 text-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-faint">
        <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 16h8M12 21h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="29" cy="21" r="2" fill="var(--accent)" />
      </svg>
      <h2 className="mt-4 font-display text-lg font-600 text-ink">No units match those filters</h2>
      <p className="mt-1 max-w-sm text-[13px] text-muted">
        Try widening the memory range, switching region, or clearing the search text.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-md border border-line-strong px-4 py-2 text-[13px] text-ink transition-colors hover:border-accent hover:text-accent"
      >
        Reset filters
      </button>
    </div>
  );
}

/** Minimal diff between two filter states, expressed as reducer actions. */
function diffToActions(from: FilterState, to: FilterState) {
  const actions: Parameters<typeof filtersReducer>[1][] = [];
  if (from.q !== to.q) actions.push({ type: "setQuery", q: to.q });
  if (from.region !== to.region) actions.push({ type: "setRegion", region: to.region });
  if (from.memMin !== to.memMin || from.memMax !== to.memMax)
    actions.push({ type: "setMemory", min: to.memMin, max: to.memMax });
  if (from.status !== to.status) actions.push({ type: "setStatus", status: to.status });
  if (from.sort !== to.sort) actions.push({ type: "setSort", sort: to.sort });
  return actions;
}
