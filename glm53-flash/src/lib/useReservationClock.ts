"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useReservations } from "@/stores/reservations";

/**
 * A per-second wall clock for countdowns and time-window math.
 *
 * useSyncExternalStore keeps the snapshot stable within each tick (no
 * render loops) and returns 0 during SSR/hydration, so time-dependent
 * output can gate on `now === 0` and render a skeleton first — no
 * hydration mismatch. Also drives the hold-expiry sweep that keeps the
 * reservations store honest as time passes.
 */
function subscribeToSeconds(onChange: () => void): () => void {
  const timer = setInterval(onChange, 1000);
  return () => clearInterval(timer);
}

export function useReservationClock(intervalMs = 1000): number {
  const quantum = Math.max(1000, intervalMs);
  const now = useSyncExternalStore(
    subscribeToSeconds,
    () => Math.floor(Date.now() / quantum) * quantum,
    () => 0,
  );

  const sweepExpired = useReservations((s) => s.sweepExpired);
  useEffect(() => {
    if (now > 0) sweepExpired(now);
  }, [now, sweepExpired]);

  return now;
}
