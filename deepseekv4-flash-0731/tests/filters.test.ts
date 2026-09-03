import { describe, expect, it } from "vitest";
import { applyFilters, DEFAULT_FILTERS, type BrowseFilters } from "@/lib/filters";
import { LISTINGS } from "@/data/listings";

const utilById: Record<string, number> = {
  "h100-01-iad": 10,
  "h200-02-iad": 90,
  "b200-04-iad": 55,
  "mi300x-01-pdx": 40,
  "h100-02-pdx": 70,
  "l40s-03-pdx": 20,
  "h100-01-dub": 30,
  "mi325x-02-dub": 80,
  "rtxpro6000-03-dub": 60,
  "m3ultra-04-dub": 15,
  "h200-01-fra": 45,
  "b200-03-fra": 65,
  "h100-04-fra": 25,
  "h100-01-sin": 50,
  "mi300x-02-sin": 35,
  "rtx5090-03-sin": 5,
  "h200-01-nrt": 75,
  "h100-02-nrt": 85,
  "m3ultra-04-nrt": 95,
};

const util = (id: string) => utilById[id] ?? 0;

function filters(overrides: Partial<BrowseFilters>): BrowseFilters {
  return { ...DEFAULT_FILTERS, ...overrides };
}

describe("applyFilters", () => {
  it("returns everything with default filters", () => {
    const result = applyFilters(LISTINGS, DEFAULT_FILTERS, util);
    expect(result).toHaveLength(LISTINGS.length);
  });

  it("filters by search query across name, chip, region and rack", () => {
    expect(applyFilters(LISTINGS, filters({ query: "h100" }), util).every((l) => l.chipId === "h100")).toBe(true);
    expect(applyFilters(LISTINGS, filters({ query: "IAD" }), util).every((l) => l.regionId === "us-east-1")).toBe(true);
    expect(applyFilters(LISTINGS, filters({ query: "rack-05" }), util)).toHaveLength(1);
  });

  it("filters by region", () => {
    const result = applyFilters(LISTINGS, filters({ region: "eu-west-1" }), util);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((l) => l.regionId === "eu-west-1")).toBe(true);
  });

  it("filters by memory range", () => {
    const mid = applyFilters(LISTINGS, filters({ minMemoryGB: 80, maxMemoryGB: 141 }), util);
    expect(mid.length).toBeGreaterThan(0);
    expect(mid.every((l) => l.memoryGB >= 80 && l.memoryGB <= 141)).toBe(true);
  });

  it("filters by status", () => {
    const result = applyFilters(LISTINGS, filters({ status: "maintenance" }), util);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((l) => l.status === "maintenance")).toBe(true);
  });

  it("returns an empty list when nothing matches", () => {
    const result = applyFilters(LISTINGS, filters({ query: "zzz-no-such-gpu" }), util);
    expect(result).toEqual([]);
  });

  it("combines query, region, memory and status into one result set", () => {
    // H100s in US East with at least 80GB that are available
    const result = applyFilters(
      LISTINGS,
      filters({ query: "h100", region: "us-east-1", minMemoryGB: 80, status: "available" }),
      util,
    );
    expect(result.length).toBe(1);
    expect(result[0]?.slug).toBe("h100-01-iad");
  });

  it("sorts by price ascending and descending", () => {
    const asc = applyFilters(LISTINGS, filters({ sort: "price-asc" }), util);
    const desc = applyFilters(LISTINGS, filters({ sort: "price-desc" }), util);
    const prices = asc.map((l) => l.hourlyRateCents);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(desc[0]?.hourlyRateCents).toBe(Math.max(...LISTINGS.map((l) => l.hourlyRateCents)));
  });

  it("sorts by memory and TFLOPS descending", () => {
    const mem = applyFilters(LISTINGS, filters({ sort: "memory-desc" }), util);
    const memVals = mem.map((l) => l.memoryGB);
    expect(memVals).toEqual([...memVals].sort((a, b) => b - a));

    const tf = applyFilters(LISTINGS, filters({ sort: "tflops-desc" }), util);
    const tfVals = tf.map((l) => l.tflops);
    expect(tfVals).toEqual([...tfVals].sort((a, b) => b - a));
  });

  it("sorts by current utilization descending", () => {
    const result = applyFilters(LISTINGS, filters({ sort: "utilization-desc" }), util);
    const vals = result.map((l) => util(l.id));
    expect(vals).toEqual([...vals].sort((a, b) => b - a));
  });

  it("does not mutate the input list", () => {
    const before = LISTINGS.map((l) => l.slug);
    applyFilters(LISTINGS, filters({ sort: "price-desc" }), util);
    expect(LISTINGS.map((l) => l.slug)).toEqual(before);
  });
});
