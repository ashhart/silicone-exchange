import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE = 3;

interface CompareStore {
  ids: string[];
  /** Toggle membership. Returns false when rejected (limit reached). */
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const { ids } = get();
        if (ids.includes(id)) {
          set({ ids: ids.filter((x) => x !== id) });
          return true;
        }
        if (ids.length >= MAX_COMPARE) return false;
        set({ ids: [...ids, id] });
        return true;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      clear: () => set({ ids: [] }),
    }),
    { name: "silicon-exchange.compare.v1", version: 1 },
  ),
);
