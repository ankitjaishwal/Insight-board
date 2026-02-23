import { useQuery } from "@tanstack/react-query";
import { fetchPresets } from "../api/presetsApi";
import type { FilterPreset } from "../types/preset";

export const presetsQueryKey = ["presets"] as const;

export function usePresetsQuery() {
  return useQuery<FilterPreset[]>({
    queryKey: presetsQueryKey,
    queryFn: fetchPresets,
    placeholderData: [],
  });
}
