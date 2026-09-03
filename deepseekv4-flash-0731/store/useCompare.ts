import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const MAX_COMPARE = 3;

interface CompareState {
  ids: string[];
  toggle: (listingId: string) => void;
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (listingId) =>
        set((s) => {
          if (s.ids.includes(listingId)) return { ids: s.ids.filter((x) => x !== listingId) };
          if (s.ids.length >= MAX_COMPARE) return s;
          return { ids: [...s.ids, listingId] };
        }),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "sx-compare-v1",
      storage: createJSONStorage(() => window.localStorage),
    },
  ),
);
