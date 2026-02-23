import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPreset } from "../api/presetsApi";
import type { FilterPreset } from "../types/preset";
import { presetsQueryKey } from "./usePresetsQuery";

type MutationContext = {
  previousPresets: FilterPreset[];
};

export function useCreatePreset() {
  const queryClient = useQueryClient();

  return useMutation<FilterPreset, Error, FilterPreset, MutationContext>({
    mutationFn: createPreset,
    onMutate: async (newPreset) => {
      await queryClient.cancelQueries({ queryKey: presetsQueryKey });

      const previousPresets =
        queryClient.getQueryData<FilterPreset[]>(presetsQueryKey) ?? [];

      queryClient.setQueryData<FilterPreset[]>(presetsQueryKey, [
        ...previousPresets,
        newPreset,
      ]);

      return { previousPresets };
    },
    onError: (_error, _newPreset, context) => {
      queryClient.setQueryData(
        presetsQueryKey,
        context?.previousPresets ?? [],
      );
      alert("Failed to save preset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetsQueryKey });
    },
  });
}
