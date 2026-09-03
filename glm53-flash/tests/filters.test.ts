import { describe, expect, it } from "vitest";
import {
  applyFilters,
  parseFilters,
  serializeFilters,
  filtersReducer,
  DEFAULT_FILTERS,
  type FilterState,
} from "@/lib/filters";
import { LISTINGS } from "@/data/listings";

const UTILIZATION = new Map<string, number>([
  ["LST-001", 55],
  ["LST-002", 71],
  ["LST-006", 30],
]);

const state = (overrides: Partial<FilterState>): FilterState => ({ ...DEFAULT_FILTERS, ...overrides });

describe("applyFilters — combined query", () => {
  it("combines region, memory range, status and search text", () => {
    const filters = state({ region: "us-west-2", memMin: 80, memMax: 80, status: "available", q: "h100" });
    const result = applyFilters(LISTINGS, filters, UTILIZATION);
    expect(result.map((l) => l.id)).toEqual(["LST-002", "LST-001"]); // price-asc: $2.65 before $3.20
  });

  it("search matches chip, vendor, region and site text", () => {
    const amd = applyFilters(LISTINGS, state({ q: "amd" }), UTILIZATION);
    expect(amd.every((l) => l.vendor === "AMD")).toBe(true);
    expect(amd.length).toBeGreaterThan(0);

    const rack = applyFilters(LISTINGS, state({ q: "rack b07" }), UTILIZATION);
    expect(rack.map((l) => l.id)).toEqual(["LST-001"]);
  });

  it("status filter separates maintenance and retired units", () => {
    const maintenance = applyFilters(LISTINGS, state({ status: "maintenance" }), UTILIZATION);
    expect(maintenance.map((l) => l.id)).toEqual(["LST-017", "LST-015", "LST-020"]);

    const retired = applyFilters(LISTINGS, state({ status: "retired" }), UTILIZATION);
    expect(retired.map((l) => l.id)).toEqual(["LST-021", "LST-022"]);
  });

  it("memory bounds are inclusive on both ends", () => {
    const atLeast192 = applyFilters(LISTINGS, state({ memMin: 192 }), UTILIZATION);
    expect(atLeast192.every((l) => l.memoryGB >= 192)).toBe(true);
    expect(atLeast192.some((l) => l.memoryGB === 192)).toBe(true);

    const exactly48 = applyFilters(LISTINGS, state({ memMin: 48, memMax: 48 }), UTILIZATION);
    expect(exactly48.every((l) => l.memoryGB === 48)).toBe(true);
    expect(exactly48.length).toBeGreaterThan(0);
  });

  it("sorts by price ascending and descending", () => {
    const asc = applyFilters(LISTINGS, state({ sort: "price-asc" }), UTILIZATION);
    expect(asc[0].hourlyRateCents).toBeLessThanOrEqual(asc[1].hourlyRateCents);
    expect(asc[0].id).toBe("LST-021"); // retired T4, cheapest

    const desc = applyFilters(LISTINGS, state({ sort: "price-desc" }), UTILIZATION);
    expect(desc[0].hourlyRateCents).toBeGreaterThanOrEqual(desc[1].hourlyRateCents);
    expect(desc[0].id).toBe("LST-020"); // B200 in maintenance, priciest
  });

  it("sorts by memory and TFLOPS descending", () => {
    const byMemory = applyFilters(LISTINGS, state({ sort: "memory-desc" }), UTILIZATION);
    expect(byMemory[0].memoryGB).toBe(512); // M3 Ultra
    expect(byMemory[1].memoryGB).toBe(256);

    const byTflops = applyFilters(LISTINGS, state({ sort: "tflops-desc" }), UTILIZATION);
    expect(byTflops[0].tflops).toBe(2250); // B200
  });

  it("sorts by utilization using the provided map", () => {
    const byUtil = applyFilters(LISTINGS.slice(0, 3), state({ sort: "utilization-desc" }), UTILIZATION);
    expect(byUtil.map((l) => l.id)).toEqual(["LST-002", "LST-001", "LST-003"]);
  });

  it("returns an empty array when nothing matches", () => {
    const result = applyFilters(LISTINGS, state({ memMin: 4096 }), UTILIZATION);
    expect(result).toEqual([]);
  });
});

describe("filtersReducer", () => {
  it("updates individual fields without losing the rest", () => {
    let s = filtersReducer(DEFAULT_FILTERS, { type: "setRegion", region: "eu-central-1" });
    s = filtersReducer(s, { type: "setSort", sort: "tflops-desc" });
    expect(s).toEqual(state({ region: "eu-central-1", sort: "tflops-desc" }));
  });

  it("resets to defaults", () => {
    const s = filtersReducer(state({ q: "h100", sort: "memory-desc" }), { type: "reset" });
    expect(s).toEqual(DEFAULT_FILTERS);
  });
});

describe("URL round-trip", () => {
  it("serializes non-default filters and parses them back", () => {
    const filters = state({ q: "h100", region: "us-west-2", memMin: 48, memMax: 141, status: "available", sort: "memory-desc" });
    const qs = serializeFilters(filters);
    expect(parseFilters(new URLSearchParams(qs))).toEqual(filters);
  });

  it("omits default values, producing an empty query string", () => {
    expect(serializeFilters(DEFAULT_FILTERS)).toBe("");
  });

  it("falls back to defaults for invalid or missing params", () => {
    const parsed = parseFilters(new URLSearchParams("status=bogus&sort=cheapest&memMin=-5"));
    expect(parsed.status).toBe("all");
    expect(parsed.sort).toBe("price-asc");
    expect(parsed.memMin).toBeNull();
  });
});
