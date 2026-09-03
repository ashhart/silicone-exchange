export type TimeRange = {
  startMs: number;
  endMs: number;
};

/**
 * Half-open interval overlap: [start, end).
 *
 * A reservation ending at 14:00 and one starting at 14:00 do NOT overlap.
 * Degenerate ranges (end <= start) never overlap anything.
 */
export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  if (a.startMs >= a.endMs || b.startMs >= b.endMs) return false;
  return a.startMs < b.endMs && b.startMs < a.endMs;
}
