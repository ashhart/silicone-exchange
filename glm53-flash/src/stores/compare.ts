"use client";

import { create } from "zustand";
import type { Listing } from "@/lib/types";
import { LISTINGS } from "@/data/listings";

const STORAGE_KEY = "silicon-exchange.compare.v1";
export const COMPARE_LIMIT = 3;

type CompareState = {
  hydrated: boolean;
  ids: string[];
  hydrate: () => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

function persist(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable — selection still works for the session.
  }
}

export const useCompare = create<CompareState>((set, get) => ({
  hydrated: false,
  ids: [],

  hydrate: () => {
    if (get().hydrated) return;
    let ids: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const known = new Set(LISTINGS.map((l: Listing) => l.id));
          ids = parsed.filter((id): id is string => typeof id === "string" && known.has(id)).slice(0, COMPARE_LIMIT);
        }
      }
    } catch {
      ids = [];
    }
    persist(ids);
    set({ hydrated: true, ids });
  },

  toggle: (id) => {
    const { ids } = get();
    const next = ids.includes(id)
      ? ids.filter((x) => x !== id)
      : ids.length < COMPARE_LIMIT
        ? [...ids, id]
        : ids;
    if (next !== ids) {
      persist(next);
      set({ ids: next });
    }
  },

  remove: (id) => {
    const next = get().ids.filter((x) => x !== id);
    persist(next);
    set({ ids: next });
  },

  clear: () => {
    persist([]);
    set({ ids: [] });
  },
}));
