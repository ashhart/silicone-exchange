import { describe, expect, it } from "vitest";
import { rangesOverlap } from "@/lib/overlap";

const H = 3_600_000;

describe("rangesOverlap (half-open intervals)", () => {
  it("rejects a range ending exactly when another starts (14:00 end vs 14:00 start)", () => {
    const morning = { startMs: 10 * H, endMs: 14 * H };
    const afternoon = { startMs: 14 * H, endMs: 18 * H };
    expect(rangesOverlap(morning, afternoon)).toBe(false);
    expect(rangesOverlap(afternoon, morning)).toBe(false);
  });

  it("detects a genuine overlap", () => {
    const a = { startMs: 8 * H, endMs: 20 * H };
    const b = { startMs: 6 * H, endMs: 10 * H };
    expect(rangesOverlap(a, b)).toBe(true);
    expect(rangesOverlap(b, a)).toBe(true);
  });

  it("detects containment and identical ranges", () => {
    const outer = { startMs: 8 * H, endMs: 20 * H };
    const inner = { startMs: 10 * H, endMs: 12 * H };
    expect(rangesOverlap(outer, inner)).toBe(true);
    expect(rangesOverlap(outer, outer)).toBe(true);
  });

  it("rejects disjoint ranges and degenerate (empty) ranges", () => {
    expect(rangesOverlap({ startMs: 0, endMs: H }, { startMs: 2 * H, endMs: 3 * H })).toBe(false);
    expect(rangesOverlap({ startMs: 5 * H, endMs: 5 * H }, { startMs: 0, endMs: 24 * H })).toBe(false);
  });
});
