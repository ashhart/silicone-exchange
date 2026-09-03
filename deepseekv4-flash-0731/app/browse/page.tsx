"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LISTINGS } from "@/data/listings";
import { REGIONS } from "@/data/regions";
import { getUtilization } from "@/data/utilization";
import {
  applyFilters,
  DEFAULT_FILTERS,
  type BrowseFilters,
  type SortKey,
} from "@/lib/filters";
import { ListingCard } from "@/components/ListingCard";
import { Field, selectClassName } from "@/components/Field";
import { EmptyState } from "@/components/EmptyState";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "price-asc", label: "Price · low to high" },
  { value: "price-desc", label: "Price · high to low" },
  { value: "memory-desc", label: "Memory · high to low" },
  { value: "tflops-desc", label: "TFLOPS · high to low" },
  { value: "utilization-desc", label: "Utilization · high to low" },
];

const SORT_KEYS: SortKey[] = SORT_OPTIONS.map((o) => o.value);
const MEMORY_OPTIONS = [...new Set(LISTINGS.map((l) => l.memoryGB))].sort((a, b) => a - b);

function isSortKey(value: string): value is SortKey {
  return (SORT_KEYS as string[]).includes(value);
}

function parseFilters(sp: URLSearchParams): BrowseFilters {
  const min = Number(sp.get("min") ?? "0");
  const max = Number(sp.get("max") ?? "0");
  const region = sp.get("region") ?? "all";
  const status = sp.get("status") ?? "all";
  const sort = sp.get("sort") ?? DEFAULT_FILTERS.sort;
  return {
    query: sp.get("q") ?? "",
    region: REGIONS.some((r) => r.id === region) ? region : "all",
    minMemoryGB: Number.isFinite(min) && min > 0 ? min : 0,
    maxMemoryGB: Number.isFinite(max) && max > 0 ? max : 0,
    status:
      status === "available" || status === "maintenance" || status === "retired"
        ? status
        : "all",
    sort: isSortKey(sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  // The search box keeps a local draft while focused so typing never races the
  // async URL update; when unfocused it reflects the URL (back/forward safe).
  const [queryDraft, setQueryDraft] = useState(filters.query);
  const [searchFocused, setSearchFocused] = useState(false);

  const update = useCallback(
    (patch: Partial<BrowseFilters>) => {
      const next = { ...filters, ...patch };
      const sp = new URLSearchParams();
      if (next.query) sp.set("q", next.query);
      if (next.region !== "all") sp.set("region", next.region);
      if (next.minMemoryGB > 0) sp.set("min", String(next.minMemoryGB));
      if (next.maxMemoryGB > 0) sp.set("max", String(next.maxMemoryGB));
      if (next.status !== "all") sp.set("status", next.status);
      if (next.sort !== DEFAULT_FILTERS.sort) sp.set("sort", next.sort);
      const qs = sp.toString();
      router.replace(qs ? `/browse?${qs}` : "/browse", { scroll: false });
    },
    [filters, router],
  );

  const currentUtilization = useCallback((id: string) => {
    const samples = getUtilization(id);
    return samples[samples.length - 1]?.utilization ?? 0;
  }, []);

  const results = useMemo(
    () => applyFilters(LISTINGS, filters, currentUtilization),
    [filters, currentUtilization],
  );

  const hasActiveFilters =
    filters.query.trim() !== "" ||
    filters.region !== "all" ||
    filters.minMemoryGB > 0 ||
    filters.maxMemoryGB > 0 ||
    filters.status !== "all";

  const clearAll = () => update({ ...DEFAULT_FILTERS });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Browse compute</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {results.length} of {LISTINGS.length} nodes match
          </p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="font-mono text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      <form
        className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-3 lg:grid-cols-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <Field label="Search" htmlFor="browse-q">
            <input
              id="browse-q"
              type="search"
              value={searchFocused ? queryDraft : filters.query}
              onFocus={() => {
                setQueryDraft(filters.query);
                setSearchFocused(true);
              }}
              onBlur={() => setSearchFocused(false)}
              onChange={(e) => {
                setQueryDraft(e.target.value);
                update({ query: e.target.value });
              }}
              placeholder="H100, IAD, rack-05…"
              className={`${selectClassName} placeholder:text-faint`}
            />
          </Field>
        </div>
        <Field label="Region" htmlFor="browse-region">
          <select
            id="browse-region"
            value={filters.region}
            onChange={(e) => update({ region: e.target.value })}
            className={selectClassName}
          >
            <option value="all">All regions</option>
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} · {r.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Min VRAM" htmlFor="browse-min">
          <select
            id="browse-min"
            value={filters.minMemoryGB}
            onChange={(e) => update({ minMemoryGB: Number(e.target.value) })}
            className={selectClassName}
          >
            <option value="0">Any</option>
            {MEMORY_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} GB
              </option>
            ))}
          </select>
        </Field>
        <Field label="Max VRAM" htmlFor="browse-max">
          <select
            id="browse-max"
            value={filters.maxMemoryGB}
            onChange={(e) => update({ maxMemoryGB: Number(e.target.value) })}
            className={selectClassName}
          >
            <option value="0">Any</option>
            {MEMORY_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m} GB
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="browse-status">
          <select
            id="browse-status"
            value={filters.status}
            onChange={(e) => update({ status: e.target.value as BrowseFilters["status"] })}
            className={selectClassName}
          >
            <option value="all">Any status</option>
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </Field>
        <Field label="Sort" htmlFor="browse-sort">
          <select
            id="browse-sort"
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as SortKey })}
            className={selectClassName}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      </form>

      {results.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No nodes match"
            body="Try widening the memory range, clearing the status filter, or searching for a different chip."
            action={
              <button
                type="button"
                onClick={clearAll}
                className="rounded-md border border-line2 bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/50 hover:text-accent"
              >
                Reset filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">Loading…</div>}>
      <BrowseContent />
    </Suspense>
  );
}
