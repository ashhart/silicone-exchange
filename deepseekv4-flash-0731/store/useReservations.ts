import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Reservation } from "@/data/types";
import { seedReservations } from "@/data/reservations";
import { LISTING_BY_SLUG } from "@/data/listings";
import { canReserve, type BlockReason } from "@/lib/overlap";
import { expireOverdueHolds } from "@/lib/holds";
import { HOLD_MS } from "@/lib/time";

export interface HoldResult {
  ok: boolean;
  reason?: BlockReason;
  reservation?: Reservation;
}

interface ReservationsState {
  reservations: Reservation[];
  nowMs: number;
  createHold: (listingId: string, startMs: number, endMs: number) => HoldResult;
  confirm: (id: string) => void;
  cancel: (id: string) => void;
  tick: (nowMs: number) => void;
}

export const useReservations = create<ReservationsState>()(
  persist(
    (set, get) => ({
      reservations: seedReservations(),
      nowMs: Date.now(),

      createHold: (listingId, startMs, endMs) => {
        const listing = LISTING_BY_SLUG[listingId];
        if (!listing) return { ok: false, reason: "unknown-listing" };
        const { reservations } = get();
        const check = canReserve(listing, startMs, endMs, reservations);
        if (!check.ok) return { ok: false, reason: check.reason };

        const now = Date.now();
        const reservation: Reservation = {
          id: `res-${crypto.randomUUID()}`,
          listingId,
          startMs,
          endMs,
          status: "held",
          createdAtMs: now,
          heldUntilMs: now + HOLD_MS,
        };
        set({ reservations: [...reservations, reservation] });
        return { ok: true, reservation };
      },

      confirm: (id) =>
        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === id && r.status === "held"
              ? { ...r, status: "confirmed" as const, confirmedAtMs: Date.now(), heldUntilMs: undefined }
              : r,
          ),
        })),

      cancel: (id) =>
        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === id && (r.status === "held" || r.status === "confirmed")
              ? { ...r, status: "cancelled" as const }
              : r,
          ),
        })),

      tick: (nowMs) =>
        set((s) => {
          const swept = expireOverdueHolds(s.reservations, nowMs);
          if (swept === s.reservations && s.nowMs === nowMs) return s;
          return { nowMs, reservations: swept };
        }),
    }),
    {
      name: "sx-reservations-v1",
      storage: createJSONStorage(() => window.localStorage),
      partialize: (s) => ({ reservations: s.reservations }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const now = Date.now();
        state.reservations = expireOverdueHolds(state.reservations, now);
        state.nowMs = now;
      },
    },
  ),
);

/** Active (confirmed + held) reservations for one listing, sorted by start. */
export function selectActiveForListing(
  reservations: readonly Reservation[],
  listingId: string,
): Reservation[] {
  return reservations
    .filter((r) => r.listingId === listingId && (r.status === "confirmed" || r.status === "held"))
    .sort((a, b) => a.startMs - b.startMs);
}
