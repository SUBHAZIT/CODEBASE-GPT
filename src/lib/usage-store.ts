import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UsageStore {
  indexCount: number;
  incrementIndexCount: () => void;
  resetIndexCount: () => void;
}

const MAX_FREE_INDEXES = 5;

export const useUsageStore = create<UsageStore>()(
  persist(
    (set) => ({
      indexCount: 0,
      incrementIndexCount: () => set((state) => ({ indexCount: state.indexCount + 1 })),
      resetIndexCount: () => set({ indexCount: 0 }),
    }),
    {
      name: "codebase-gpt-usage",
    }
  )
);
