import { describe, expect, it } from "vitest";
import {
  applyFilters,
  DEFAULT_FILTERS,
  filterReducer,
  parseFilters,
  writeFilters,
  type FilterState,
} from "./filters";
import type { Listing } from "./types";

function l(
  id: string,
  chip: string,
  region: Listing["region"],
  memoryGb: number,
  tflops: number,
  priceCentsPerHour: number,
  status: Listing["status"] = "available",
): Listing {
  return { id, chip, region, memoryGb, tflops, priceCentsPerHour, status } as Listing;
}

const FIXTURE: Listing[] = [
  l("SX-01", "H100 SXM", "us-east", 80, 989, 425),
  l("SX-02", "RTX 4090", "us-west", 24, 330, 58),
  l("SX-03", "MI300X", "eu-central", 192, 1_307, 265),
  l("SX-04", "H100 SXM", "ap-southeast", 80, 989, 350),
  l("SX-05", "A100", "eu-central", 80, 312, 185, "maintenance"),
  l("SX-06", "RTX 5090", "eu-central", 32, 419, 69),
];

const UTIL: Record<string, number> = {
  "SX-01": 55, "SX-02": 80, "SX-03": 40, "SX-04": 70, "SX-05": 20, "SX-06": 65,
};

describe("filterReducer", () => {
  it("toggles set members on and off", () => {
    let s = filterReducer(DEFAULT_FILTERS, { type: "toggle-region", region: "eu-central" });
    expect(s.regions).toEqual(["eu-central"]);
    s = filterReducer(s, { type: "toggle-region", region: "us-east" });
    expect(s.regions).toEqual(["eu-central", "us-east"]);
    s = filterReducer(s, { type: "toggle-region", region: "eu-central" });
    expect(s.regions).toEqual(["us-east"]);
  });

  it("sets memory bounds and resets everything", () => {
    let s = filterReducer(DEFAULT_FILTERS, { type: "query", q: "h100" });
    s = filterReducer(s, { type: "mem-min", gb: 64 });
    s = filterReducer(s, { type: "mem-max", gb: 200 });
    expect(s).toMatchObject({ q: "h100", memMinGb: 64, memMaxGb: 200 });
    expect(filterReducer(s, { type: "reset" })).toEqual(DEFAULT_FILTERS);
  });
});

describe("applyFilters", () => {
  it("returns correct results for one combined query", () => {
    const state: FilterState = {
      q: "",
      regions: ["eu-central", "ap-southeast"],
      memMinGb: 80,
      memMaxGb: 200,
      statuses: ["available"],
      sort: "tflops-desc",
    };
    // eu-central/ap-southeast, 80-200GB, available: SX-03 (192) + SX-04 (80);
    // SX-05 is maintenance, SX-06 only 32GB, SX-01/02 wrong region.
    expect(applyFilters(FIXTURE, state, UTIL).map((x) => x.id)).toEqual([
      "SX-03",
      "SX-04",
    ]);
  });

  it("combines free text with region, status, and memory bounds", () => {
    const state: FilterState = {
      ...DEFAULT_FILTERS,
      q: "100 s", // substring of "h100 sxm" in the search haystack
      regions: ["eu-central"],
      statuses: ["available"],
    };
    expect(applyFilters(FIXTURE, state, UTIL).map((x) => x.id)).toEqual([]);
    const q2 = { ...state, q: "rtx" };
    expect(applyFilters(FIXTURE, q2, UTIL).map((x) => x.id)).toEqual(["SX-06"]);
  });

  it("sorts by utilization descending", () => {
    const state = { ...DEFAULT_FILTERS, sort: "util-desc" as const };
    expect(
      applyFilters(FIXTURE, state, UTIL).slice(0, 3).map((x) => x.id),
    ).toEqual(["SX-02", "SX-04", "SX-06"]);
  });

  it("sorts by price ascending with a stable tiebreak", () => {
    const state = { ...DEFAULT_FILTERS, sort: "price-asc" as const };
    expect(applyFilters(FIXTURE, state, UTIL).map((x) => x.id)).toEqual([
      "SX-02", "SX-06", "SX-05", "SX-03", "SX-04", "SX-01",
    ]);
  });

  it("memory-desc ordering", () => {
    const state = { ...DEFAULT_FILTERS, sort: "memory-desc" as const };
    expect(applyFilters(FIXTURE, state, UTIL).map((x) => x.id)).toEqual([
      "SX-03", "SX-01", "SX-04", "SX-05", "SX-06", "SX-02",
    ]);
  });
});

describe("URL round-trip", () => {
  it("parse(write(state)) === state for non-default values", () => {
    const state = {
      q: "h100",
      regions: ["eu-central", "ap-southeast"] as Listing["region"][],
      memMinGb: 80,
      memMaxGb: 200,
      statuses: ["available"] as Listing["status"][],
      sort: "price-asc" as const,
    };
    expect(parseFilters(writeFilters(state))).toEqual(state);
  });

  it("omits defaults but keeps q verbatim for typing round-trips", () => {
    expect(writeFilters(DEFAULT_FILTERS).size).toBe(0);
    expect(writeFilters({ ...DEFAULT_FILTERS, q: " mi300x " }).toString()).toBe(
      "q=+mi300x+",
    );
    // Mid-typing state (trailing space) must survive the URL round-trip.
    const mid = { ...DEFAULT_FILTERS, q: "h100 " };
    expect(parseFilters(writeFilters(mid)).q).toBe("h100 ");
  });

  it("drops junk values found in the wild", () => {
    const junk = new URLSearchParams(
      "q=x&region=mars,us-east&status=broken,retired&memmin=abc&memmax=64&sort=whatever",
    );
    expect(parseFilters(junk)).toEqual({
      q: "x",
      regions: ["us-east"],
      memMinGb: null,
      memMaxGb: 64,
      statuses: ["retired"],
      sort: "default",
    });
  });
});
