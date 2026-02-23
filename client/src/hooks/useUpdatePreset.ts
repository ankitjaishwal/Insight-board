import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePreset } from "../api/presetsApi";
import type { FilterPreset } from "../types/preset";
import { presetsQueryKey } from "./usePresetsQuery";

type MutationContext = {
  previousPresets: FilterPreset[];
};

export function useUpdatePreset() {
  const queryClient = useQueryClient();

  return useMutation<FilterPreset, Error, FilterPreset, MutationContext>({
    mutationFn: updatePreset,
    onMutate: async (nextPreset) => {
      await queryClient.cancelQueries({ queryKey: presetsQueryKey });

      const previousPresets =
        queryClient.getQueryData<FilterPreset[]>(presetsQueryKey) ?? [];

      queryClient.setQueryData<FilterPreset[]>(
        presetsQueryKey,
        previousPresets.map((preset) =>
          preset.id === nextPreset.id ? nextPreset : preset,
        ),
      );

      return { previousPresets };
    },
    onError: (_error, _nextPreset, context) => {
      queryClient.setQueryData(
        presetsQueryKey,
        context?.previousPresets ?? [],
      );
      alert("Failed to update preset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetsQueryKey });
    },
  });
}
