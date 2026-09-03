import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Reservation } from "../lib/types";
import { canReserve } from "../lib/overlap";
import { effectiveStatus, HOLD_TTL_MS } from "../lib/hold";
import { quoteForRange } from "../lib/money";
import { utcLabel } from "../lib/format";
import { seedReservations } from "../data/reservations";
import { getListingById } from "../data/listings";

export type MutationResult = { ok: true; id: string } | { ok: false; error: string };

interface ReservationStore {
  reservations: Reservation[];
  ensureSeeded: (now: number) => void;
  createHold: (
    listingId: string,
    start: number,
    end: number,
    now: number,
  ) => MutationResult;
  confirm: (id: string, now: number) => MutationResult;
  cancel: (id: string, now: number) => void;
  /** Flip timed-out holds to "expired" in the store. Returns how many. */
  sweepExpired: (now: number) => number;
}

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      reservations: [],

      ensureSeeded: (now) => {
        if (get().reservations.length === 0) {
          set({ reservations: seedReservations(now) });
        }
      },

      createHold: (listingId, start, end, now) => {
        const listing = getListingById(listingId);
        if (!listing) return { ok: false, error: "Unknown listing." };
        if (start < now - 60_000) {
          return { ok: false, error: "Start time is already in the past." };
        }
        const verdict = canReserve(listing, get().reservations, start, end, now);
        if (!verdict.ok) {
          const errors: Record<string, string> = {
            "invalid-range": "Reservation must run forwards, at least 1 minute.",
            maintenance:
              "Listing is under maintenance — new reservations are paused. Existing confirmed bookings are unaffected.",
            retired: "This listing has been retired from the exchange.",
          };
          const error =
            verdict.reason === "conflict"
              ? `Overlaps ${verdict.conflict.id} (${utcLabel(verdict.conflict.start)} → ${utcLabel(verdict.conflict.end)}). Pick another window.`
              : errors[verdict.reason];
          return { ok: false, error };
        }
        const quote = quoteForRange(listing.priceCentsPerHour, start, end);
        const id = `r-${now.toString(36)}-${get().reservations.length.toString(36)}`;
        const reservation: Reservation = {
          id,
          listingId,
          start,
          end,
          status: "held",
          priceCents: quote.totalCents,
          createdAt: now,
          heldAt: now,
        };
        set({ reservations: [...get().reservations, reservation] });
        return { ok: true, id };
      },

      confirm: (id, now) => {
        const r = get().reservations.find((x) => x.id === id);
        if (!r) return { ok: false, error: "Reservation not found." };
        if (effectiveStatus(r, now) !== "held") {
          return { ok: false, error: "That hold is no longer active." };
        }
        set({
          reservations: get().reservations.map((x) =>
            x.id === id
              ? { ...x, status: "confirmed", confirmedAt: now }
              : x,
          ),
        });
        return { ok: true, id };
      },

      cancel: (id, now) => {
        set({
          reservations: get().reservations.map((x) =>
            x.id === id
              ? { ...x, status: "cancelled", cancelledAt: now }
              : x,
          ),
        });
      },

      sweepExpired: (now) => {
        const doomed = get().reservations.filter(
          (r) => r.status === "held" && now - r.heldAt > HOLD_TTL_MS,
        );
        if (doomed.length === 0) return 0;
        const ids = new Set(doomed.map((r) => r.id));
        set({
          reservations: get().reservations.map((r) =>
            ids.has(r.id)
              ? { ...r, status: "expired", expiredAt: now }
              : r,
          ),
        });
        return doomed.length;
      },
    }),
    {
      name: "silicon-exchange.reservations.v1",
      version: 1,
    },
  ),
);
