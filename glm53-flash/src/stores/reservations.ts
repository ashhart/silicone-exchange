"use client";

import { create } from "zustand";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { isHoldExpired } from "@/lib/holds";
import { hasBlockingConflict } from "@/lib/reservations";
import { quoteReservation } from "@/lib/pricing";
import { HOLD_DURATION_MS } from "@/lib/holds";
import { seedReservations } from "@/data/seedReservations";
import { LISTING_BY_ID } from "@/data/listings";

const STORAGE_KEY = "silicon-exchange.reservations.v1";

const VALID_STATUSES: readonly ReservationStatus[] = ["held", "confirmed", "cancelled", "expired"];

export type HoldResult = { ok: true; reservation: Reservation } | { ok: false; reason: string };

type ReservationsState = {
  hydrated: boolean;
  reservations: Reservation[];
  hydrate: () => void;
  createHold: (input: {
    listingId: string;
    startMs: number;
    endMs: number;
    nowMs: number;
  }) => HoldResult;
  confirmReservation: (id: string) => void;
  cancelReservation: (id: string) => void;
  sweepExpired: (nowMs: number) => void;
};

function persist(reservations: Reservation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch {
    // Storage may be unavailable (private mode, quota) — the session still works.
  }
}

function parseStored(raw: unknown): Reservation[] | null {
  if (!Array.isArray(raw)) return null;
  const parsed: Reservation[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return null;
    const r = item as Record<string, unknown>;
    if (
      typeof r.id !== "string" ||
      typeof r.listingId !== "string" ||
      typeof r.startMs !== "number" ||
      typeof r.endMs !== "number" ||
      typeof r.createdAtMs !== "number" ||
      typeof r.priceCents !== "number" ||
      typeof r.hourlyRateCents !== "number" ||
      typeof r.status !== "string" ||
      !VALID_STATUSES.includes(r.status as ReservationStatus) ||
      !Number.isFinite(r.startMs) ||
      !Number.isFinite(r.endMs) ||
      r.endMs <= r.startMs
    ) {
      return null;
    }
    parsed.push({
      id: r.id,
      listingId: r.listingId,
      startMs: r.startMs,
      endMs: r.endMs,
      status: r.status as ReservationStatus,
      createdAtMs: r.createdAtMs,
      holdExpiresAtMs: typeof r.holdExpiresAtMs === "number" ? r.holdExpiresAtMs : null,
      priceCents: r.priceCents,
      hourlyRateCents: r.hourlyRateCents,
    });
  }
  return parsed;
}

export const useReservations = create<ReservationsState>((set, get) => ({
  hydrated: false,
  reservations: [],

  hydrate: () => {
    if (get().hydrated) return;
    let stored: Reservation[] | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) stored = parseStored(JSON.parse(raw));
    } catch {
      stored = null;
    }
    const reservations = stored ?? seedReservations(Date.now());
    if (stored === null) persist(reservations);
    set({ hydrated: true, reservations });
  },

  createHold: ({ listingId, startMs, endMs, nowMs }) => {
    const listing = LISTING_BY_ID[listingId];
    if (!listing) return { ok: false, reason: "Unknown listing." };
    if (listing.status === "maintenance") {
      return { ok: false, reason: "This unit is under maintenance and is not accepting new reservations." };
    }
    if (listing.status === "retired") {
      return { ok: false, reason: "This unit has been retired from the rental pool." };
    }
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
      return { ok: false, reason: "The selected time range is invalid." };
    }
    const state = get();
    if (hasBlockingConflict(listingId, { startMs, endMs }, state.reservations, nowMs)) {
      return { ok: false, reason: "That time block overlaps an existing reservation." };
    }
    const quote = quoteReservation({ startMs, endMs, hourlyRateCents: listing.hourlyRateCents });
    if (!quote) return { ok: false, reason: "The selected time range is invalid." };

    const reservation: Reservation = {
      id: `RES-${nowMs.toString(36)}-${Math.floor(nowMs / 1000) % 100000}-${state.reservations.length}`,
      listingId,
      startMs,
      endMs,
      status: "held",
      createdAtMs: nowMs,
      holdExpiresAtMs: nowMs + HOLD_DURATION_MS,
      priceCents: quote.totalCents,
      hourlyRateCents: listing.hourlyRateCents,
    };
    const next = [reservation, ...state.reservations];
    persist(next);
    set({ reservations: next });
    return { ok: true, reservation };
  },

  confirmReservation: (id) => {
    const state = get();
    const target = state.reservations.find((r) => r.id === id);
    if (!target || target.status !== "held") return;
    const next = state.reservations.map((r) =>
      r.id === id ? { ...r, status: "confirmed" as const, holdExpiresAtMs: null } : r,
    );
    persist(next);
    set({ reservations: next });
  },

  cancelReservation: (id) => {
    const state = get();
    const target = state.reservations.find((r) => r.id === id);
    if (!target) return;
    const status = target.status === "held" || target.status === "confirmed" ? "cancelled" : target.status;
    if (status === target.status) return;
    const next = state.reservations.map((r) => (r.id === id ? { ...r, status } : r));
    persist(next);
    set({ reservations: next });
  },

  sweepExpired: (nowMs) => {
    const state = get();
    let changed = false;
    const next = state.reservations.map((r) => {
      if (isHoldExpired(r, nowMs)) {
        changed = true;
        return { ...r, status: "expired" as const };
      }
      return r;
    });
    if (changed) {
      persist(next);
      set({ reservations: next });
    }
  },
}));
