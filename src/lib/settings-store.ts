import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  compactMode: boolean;
  reducedMotion: boolean;
  cacheIndexData: boolean;
  autoSaveChatHistory: boolean;
  strictHttps: boolean;
}

interface SettingsStore {
  settings: SettingsState;
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetDefaults: () => void;
}

const DEFAULT_SETTINGS: SettingsState = {
  compactMode: false,
  reducedMotion: false,
  cacheIndexData: true,
  autoSaveChatHistory: true,
  strictHttps: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      setSetting: (key, value) =>
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),
      resetDefaults: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "codebase-gpt-settings",
    }
  )
);
