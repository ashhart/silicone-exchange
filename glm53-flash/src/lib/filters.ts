import type { Listing } from "./types";

export const SORT_KEYS = [
  "price-asc",
  "price-desc",
  "memory-desc",
  "tflops-desc",
  "utilization-desc",
] as const;

export type SortKey = (typeof SORT_KEYS)[number];

export const STATUS_FILTERS = ["all", "available", "maintenance", "retired"] as const;

export type StatusFilter = (typeof STATUS_FILTERS)[number];

export type FilterState = {
  q: string;
  region: string;
  memMin: number | null;
  memMax: number | null;
  status: StatusFilter;
  sort: SortKey;
};

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  region: "all",
  memMin: null,
  memMax: null,
  status: "all",
  sort: "price-asc",
};

export type FilterAction =
  | { type: "setQuery"; q: string }
  | { type: "setRegion"; region: string }
  | { type: "setMemory"; min: number | null; max: number | null }
  | { type: "setStatus"; status: StatusFilter }
  | { type: "setSort"; sort: SortKey }
  | { type: "reset" };

export function filtersReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "setQuery":
      return { ...state, q: action.q };
    case "setRegion":
      return { ...state, region: action.region };
    case "setMemory":
      return { ...state, memMin: action.min, memMax: action.max };
    case "setStatus":
      return { ...state, status: action.status };
    case "setSort":
      return { ...state, sort: action.sort };
    case "reset":
      return DEFAULT_FILTERS;
  }
}

/**
 * Filter + sort listings. `utilizationByListing` maps listing id to its
 * 30-day average utilization (0–100) for the utilization sort.
 */
export function applyFilters(
  listings: Listing[],
  filters: FilterState,
  utilizationByListing: ReadonlyMap<string, number>,
): Listing[] {
  const q = filters.q.trim().toLowerCase();

  const matched = listings.filter((listing) => {
    if (filters.region !== "all" && listing.region !== filters.region) return false;
    if (filters.status !== "all" && listing.status !== filters.status) return false;
    if (filters.memMin !== null && listing.memoryGB < filters.memMin) return false;
    if (filters.memMax !== null && listing.memoryGB > filters.memMax) return false;
    if (q.length > 0) {
      const haystack =
        `${listing.chip} ${listing.vendor} ${listing.region} ${listing.site} ${listing.slug}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const utilizationOf = (listing: Listing): number => utilizationByListing.get(listing.id) ?? 0;

  const comparators: Record<SortKey, (a: Listing, b: Listing) => number> = {
    "price-asc": (a, b) => a.hourlyRateCents - b.hourlyRateCents,
    "price-desc": (a, b) => b.hourlyRateCents - a.hourlyRateCents,
    "memory-desc": (a, b) => b.memoryGB - a.memoryGB,
    "tflops-desc": (a, b) => b.tflops - a.tflops,
    "utilization-desc": (a, b) => utilizationOf(b) - utilizationOf(a),
  };

  return matched.sort(comparators[filters.sort]);
}

/** Parse filter state from URLSearchParams; invalid values fall back to defaults. */
export function parseFilters(params: URLSearchParams): FilterState {
  const statusRaw = params.get("status");
  const sortRaw = params.get("sort");
  return {
    q: params.get("q") ?? "",
    region: params.get("region") ?? DEFAULT_FILTERS.region,
    memMin: parseNonNegativeInt(params.get("memMin")),
    memMax: parseNonNegativeInt(params.get("memMax")),
    status: STATUS_FILTERS.find((s) => s === statusRaw) ?? DEFAULT_FILTERS.status,
    sort: SORT_KEYS.find((s) => s === sortRaw) ?? DEFAULT_FILTERS.sort,
  };
}

/** Serialize to a query string, omitting anything at its default. Empty string when default. */
export function serializeFilters(filters: FilterState): string {
  const params = new URLSearchParams();
  const q = filters.q.trim();
  if (q.length > 0) params.set("q", q);
  if (filters.region !== DEFAULT_FILTERS.region) params.set("region", filters.region);
  if (filters.memMin !== null) params.set("memMin", String(filters.memMin));
  if (filters.memMax !== null) params.set("memMax", String(filters.memMax));
  if (filters.status !== DEFAULT_FILTERS.status) params.set("status", filters.status);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  return params.toString();
}

function parseNonNegativeInt(raw: string | null): number | null {
  if (raw === null || raw.trim().length === 0) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}
