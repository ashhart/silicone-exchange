import type { Listing } from "@/data/types";

export type SortKey =
  | "price-asc"
  | "price-desc"
  | "memory-desc"
  | "tflops-desc"
  | "utilization-desc";

export interface BrowseFilters {
  query: string;
  region: string; // "all" or a region id
  minMemoryGB: number; // 0 = no floor
  maxMemoryGB: number; // 0 = no ceiling
  status: "all" | "available" | "maintenance" | "retired";
  sort: SortKey;
}

export const DEFAULT_FILTERS: BrowseFilters = {
  query: "",
  region: "all",
  minMemoryGB: 0,
  maxMemoryGB: 0,
  status: "all",
  sort: "price-asc",
};

export function applyFilters(
  listings: readonly Listing[],
  filters: BrowseFilters,
  currentUtilization: (listingId: string) => number,
): Listing[] {
  const q = filters.query.trim().toLowerCase();

  const filtered = listings.filter((l) => {
    if (q) {
      const hay = `${l.name} ${l.chipId} ${l.regionId} ${l.rack} ${l.hostname}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.region !== "all" && l.regionId !== filters.region) return false;
    if (filters.minMemoryGB > 0 && l.memoryGB < filters.minMemoryGB) return false;
    if (filters.maxMemoryGB > 0 && l.memoryGB > filters.maxMemoryGB) return false;
    if (filters.status !== "all" && l.status !== filters.status) return false;
    return true;
  });

  return [...filtered].sort(comparatorFor(filters.sort, currentUtilization));
}

function comparatorFor(
  sort: SortKey,
  currentUtilization: (listingId: string) => number,
): (a: Listing, b: Listing) => number {
  switch (sort) {
    case "price-asc":
      return (a, b) => a.hourlyRateCents - b.hourlyRateCents;
    case "price-desc":
      return (a, b) => b.hourlyRateCents - a.hourlyRateCents;
    case "memory-desc":
      return (a, b) => b.memoryGB - a.memoryGB;
    case "tflops-desc":
      return (a, b) => b.tflops - a.tflops;
    case "utilization-desc":
      return (a, b) => currentUtilization(b.id) - currentUtilization(a.id);
  }
}
