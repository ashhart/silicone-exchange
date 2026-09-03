"use client";

import { useEffect } from "react";
import { useReservations } from "@/stores/reservations";
import { useCompare } from "@/stores/compare";
import { useTheme } from "@/stores/theme";

/**
 * Mounts once per page load and pulls persisted client state
 * (reservations, compare selection, theme) out of localStorage.
 */
export function StoreHydrator() {
  const hydrateReservations = useReservations((s) => s.hydrate);
  const hydrateCompare = useCompare((s) => s.hydrate);
  const hydrateTheme = useTheme((s) => s.hydrate);

  useEffect(() => {
    hydrateTheme();
    hydrateReservations();
    hydrateCompare();
  }, [hydrateTheme, hydrateReservations, hydrateCompare]);

  return null;
}
