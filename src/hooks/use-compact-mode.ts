import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useSettingsStore } from "@/lib/settings-store";

export function useCompactMode() {
  const [searchParams] = useSearchParams();
  const { settings } = useSettingsStore();
  
  return useMemo(() => {
    if (searchParams.get("mode") === "compact") return true;
    return settings.compactMode;
  }, [searchParams, settings.compactMode]);
}
