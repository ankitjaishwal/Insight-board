import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePreset } from "../api/presetsApi";
import type { FilterPreset } from "../types/preset";
import { presetsQueryKey } from "./usePresetsQuery";

type MutationContext = {
  previousPresets: FilterPreset[];
};

export function useDeletePreset() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string, MutationContext>({
    mutationFn: deletePreset,
    onMutate: async (presetId) => {
      await queryClient.cancelQueries({ queryKey: presetsQueryKey });

      const previousPresets =
        queryClient.getQueryData<FilterPreset[]>(presetsQueryKey) ?? [];

      queryClient.setQueryData<FilterPreset[]>(
        presetsQueryKey,
        previousPresets.filter((preset) => preset.id !== presetId),
      );

      return { previousPresets };
    },
    onError: (_error, _presetId, context) => {
      queryClient.setQueryData(
        presetsQueryKey,
        context?.previousPresets ?? [],
      );
      alert("Failed to delete preset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetsQueryKey });
    },
  });
}
