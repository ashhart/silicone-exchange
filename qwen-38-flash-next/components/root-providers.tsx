"use client";

import { useEffect, type ReactNode } from "react";
import { useReservationStore } from "@/store/reservations";

/**
 * Client root side effects: seed the demo reservations into an empty store,
 * then sweep timed-out holds to "expired" on a real 1-second timer.
 */
export function RootProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    const store = useReservationStore.getState();
    store.ensureSeeded(Date.now());
    const tick = () => useReservationStore.getState().sweepExpired(Date.now());
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);
  return <>{children}</>;
}
