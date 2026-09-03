import { describe, expect, it } from "vitest";
import {
  avgUtil24h,
  DATA_END_UTC,
  last24h,
  SAMPLE_HOURS,
  samplesForListingId,
  utilByListing,
} from "./utilization";
import { HOUR_MS } from "../lib/time";

describe("utilization telemetry", () => {
  it("produces 30 days of hourly samples ending at the fixed anchor", () => {
    const s = samplesForListingId("SX-01");
    expect(s).toHaveLength(SAMPLE_HOURS);
    expect(SAMPLE_HOURS).toBe(30 * 24);
    expect(s[s.length - 1].t).toBe(DATA_END_UTC);
    expect(s[0].t).toBe(DATA_END_UTC - (SAMPLE_HOURS - 1) * HOUR_MS);
  });

  it("is deterministic across calls (identical reloads)", () => {
    expect(samplesForListingId("SX-07")).toEqual(samplesForListingId("SX-07"));
    expect(avgUtil24h("SX-22")).toBe(avgUtil24h("SX-22"));
  });

  it("keeps utilization in 0-100 and power within the unit's limit", () => {
    for (const id of ["SX-01", "SX-05", "SX-13", "SX-18", "SX-24"]) {
      for (const sample of samplesForListingId(id)) {
        expect(sample.utilPct).toBeGreaterThanOrEqual(0);
        expect(sample.utilPct).toBeLessThanOrEqual(100);
        expect(Number.isInteger(sample.utilPct)).toBe(true);
        expect(sample.watts).toBeLessThanOrEqual(
          id === "SX-18" ? 70 : Number.POSITIVE_INFINITY,
        );
        expect(sample.watts).toBeGreaterThan(0);
        expect(Number.isInteger(sample.watts)).toBe(true);
      }
    }
  });

  it("is organic: not a flat line, and differs per listing", () => {
    const a = samplesForListingId("SX-01");
    const b = samplesForListingId("SX-02");
    const distinct = new Set(a.map((s) => s.utilPct)).size;
    expect(distinct).toBeGreaterThan(10);
    expect(a[100].utilPct === b[100].utilPct && a[101].utilPct === b[101].utilPct).toBe(false);
  });

  it("exposes a trailing 24h window and per-listing averages", () => {
    expect(last24h("SX-03")).toHaveLength(24);
    expect(last24h("SX-03")[23].t).toBe(DATA_END_UTC);
    const util = utilByListing();
    expect(Object.keys(util)).toHaveLength(24);
    for (const v of Object.values(util)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});
