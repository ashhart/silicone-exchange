import type { Listing, ListingStatus, Region } from "./types";
import { REGIONS } from "./types";

/**
 * Browse filter state. The URL query string is the source of truth: this
 * reducer is pure, and `parseFilters`/`writeFilters` round-trip the state
 * through the query string so refresh and the back button just work.
 */

export type SortKey =
  | "default"
  | "price-asc"
  | "price-desc"
  | "memory-desc"
  | "tflops-desc"
  | "util-desc";

export const SORT_KEYS: readonly SortKey[] = [
  "default",
  "price-asc",
  "price-desc",
  "memory-desc",
  "tflops-desc",
  "util-desc",
];

export interface FilterState {
  q: string;
  regions: Region[];
  memMinGb: number | null;
  memMaxGb: number | null;
  statuses: ListingStatus[];
  sort: SortKey;
}

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  regions: [],
  memMinGb: null,
  memMaxGb: null,
  statuses: [],
  sort: "default",
};

const STATUSES: readonly ListingStatus[] = [
  "available",
  "maintenance",
  "retired",
];

export type FilterAction =
  | { type: "query"; q: string }
  | { type: "toggle-region"; region: Region }
  | { type: "mem-min"; gb: number | null }
  | { type: "mem-max"; gb: number | null }
  | { type: "toggle-status"; status: ListingStatus }
  | { type: "sort"; sort: SortKey }
  | { type: "reset" };

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export function filterReducer(
  state: FilterState,
  action: FilterAction,
): FilterState {
  switch (action.type) {
    case "query":
      return { ...state, q: action.q };
    case "toggle-region":
      return { ...state, regions: toggle(state.regions, action.region) };
    case "mem-min":
      return { ...state, memMinGb: action.gb };
    case "mem-max":
      return { ...state, memMaxGb: action.gb };
    case "toggle-status":
      return { ...state, statuses: toggle(state.statuses, action.status) };
    case "sort":
      return { ...state, sort: action.sort };
    case "reset":
      return { ...DEFAULT_FILTERS };
  }
}

/**
 * Apply filters + sort. `utilByListing` is avg utilization % per listing id.
 * Memory bounds are inclusive. Default sort is by stable id.
 */
export function applyFilters(
  listings: readonly Listing[],
  state: FilterState,
  utilByListing: Readonly<Record<string, number>>,
): Listing[] {
  const q = state.q.trim().toLowerCase();
  const out = listings.filter((l) => {
    if (q.length > 0) {
      const haystack =
        `${l.id} ${l.name} ${l.vendor} ${l.chip} ${l.region} ${l.city}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (state.regions.length > 0 && !state.regions.includes(l.region)) {
      return false;
    }
    if (state.statuses.length > 0 && !state.statuses.includes(l.status)) {
      return false;
    }
    if (state.memMinGb !== null && l.memoryGb < state.memMinGb) return false;
    if (state.memMaxGb !== null && l.memoryGb > state.memMaxGb) return false;
    return true;
  });
  const bySort: Record<SortKey, (a: Listing, b: Listing) => number> = {
    default: (a, b) => a.id.localeCompare(b.id),
    "price-asc": (a, b) =>
      a.priceCentsPerHour - b.priceCentsPerHour || a.id.localeCompare(b.id),
    "price-desc": (a, b) =>
      b.priceCentsPerHour - a.priceCentsPerHour || a.id.localeCompare(b.id),
    "memory-desc": (a, b) =>
      b.memoryGb - a.memoryGb || a.id.localeCompare(b.id),
    "tflops-desc": (a, b) => b.tflops - a.tflops || a.id.localeCompare(b.id),
    "util-desc": (a, b) =>
      (utilByListing[b.id] ?? 0) - (utilByListing[a.id] ?? 0) ||
      a.id.localeCompare(b.id),
  };
  return out.sort(bySort[state.sort]);
}

function parseIntStrict(raw: string): number | null {
  if (!/^\d+$/.test(raw.trim())) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isSafeInteger(n) ? n : null;
}

/** Parse a query string, tolerating junk: unknown values are dropped. */
export function parseFilters(params: URLSearchParams): FilterState {
  const csv = (key: string): string[] =>
    (params.get(key) ?? "").split(",").filter((v) => v.length > 0);

  const regions = [...new Set(csv("region"))].filter((r): r is Region =>
    (REGIONS as readonly string[]).includes(r),
  );
  const statuses = [...new Set(csv("status"))].filter(
    (s): s is ListingStatus => (STATUSES as readonly string[]).includes(s),
  );
  const sortRaw = params.get("sort") ?? "default";
  const sort = (SORT_KEYS as readonly string[]).includes(sortRaw)
    ? (sortRaw as SortKey)
    : "default";
  const memMinRaw = params.get("memmin");
  const memMaxRaw = params.get("memmax");

  return {
    q: (params.get("q") ?? "").slice(0, 80),
    regions,
    memMinGb: memMinRaw === null ? null : parseIntStrict(memMinRaw),
    memMaxGb: memMaxRaw === null ? null : parseIntStrict(memMaxRaw),
    statuses,
    sort,
  };
}

/** Serialize into a query string; defaults are omitted for clean URLs. */
export function writeFilters(
  state: FilterState,
  into: URLSearchParams = new URLSearchParams(),
): URLSearchParams {
  const setOrDelete = (key: string, value: string | null) => {
    if (value === null || value.length === 0) into.delete(key);
    else into.set(key, value);
  };
  setOrDelete("q", state.q === "" ? null : state.q);
  setOrDelete(
    "region",
    state.regions.length > 0 ? state.regions.join(",") : null,
  );
  setOrDelete(
    "status",
    state.statuses.length > 0 ? state.statuses.join(",") : null,
  );
  setOrDelete("memmin", state.memMinGb === null ? null : String(state.memMinGb));
  setOrDelete("memmax", state.memMaxGb === null ? null : String(state.memMaxGb));
  setOrDelete("sort", state.sort === "default" ? null : state.sort);
  return into;
}

export function isDefaultFilters(state: FilterState): boolean {
  return writeFilters(state).size === 0;
}
