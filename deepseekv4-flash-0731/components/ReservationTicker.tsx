"use client";

import { useEffect } from "react";
import { useReservations } from "@/store/useReservations";

/** Drives hold expiry: sweeps the store every second so held reservations flip to expired. */
export function ReservationTicker() {
  const tick = useReservations((s) => s.tick);
  useEffect(() => {
    const id = window.setInterval(() => tick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [tick]);
  return null;
}
