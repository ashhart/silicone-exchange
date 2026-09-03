"use client";

import type { Listing } from "@/data/types";
import { useMounted } from "@/lib/useMounted";
import { selectActiveForListing, useReservations } from "@/store/useReservations";
import { ReservationForm } from "@/components/ReservationForm";

export function DetailReservationPanel({ listing }: { listing: Listing }) {
  const mounted = useMounted();
  const reservations = useReservations((s) => s.reservations);

  if (!mounted) {
    return <div className="h-72 animate-pulse rounded-xl border border-line bg-surface" />;
  }

  const active = selectActiveForListing(reservations, listing.id);
  return <ReservationForm listing={listing} reservations={active} />;
}
