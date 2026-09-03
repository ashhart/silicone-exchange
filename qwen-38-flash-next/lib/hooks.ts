"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};
const snapshotTrue = () => true;
const snapshotFalse = () => false;

/** False during SSR/first paint; true after mount. Gate localStorage reads. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNoop, snapshotTrue, snapshotFalse);
}

const clockServerSnapshot = () => 0;

/**
 * A ticking clock: Date.now() refreshed every `intervalMs`. Returns 0 until
 * the store attaches (SSR + first client paint), so callers can render a
 * stable placeholder and avoid hydration mismatches.
 */
export function useNow(intervalMs = 1_000): number {
  const clock = useRef<{ t: number } | null>(null);
  if (clock.current === null) clock.current = { t: 0 };
  const c = clock.current;

  const subscribe = useCallback(
    (onChange: () => void) => {
      const emit = () => {
        c.t = Date.now();
        onChange();
      };
      emit();
      const id = setInterval(emit, intervalMs);
      return () => clearInterval(id);
    },
    [intervalMs, c],
  );

  const getSnapshot = useCallback(() => c.t, [c]);

  return useSyncExternalStore(subscribe, getSnapshot, clockServerSnapshot);
}
