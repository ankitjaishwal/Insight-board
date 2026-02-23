import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateTransaction,
  type TransactionListResponse,
  type UpdateTransactionPayload,
} from "../api/transactionApi";
import { transactionsQueryKey } from "./useTransactionQuery";

type UpdateVariables = {
  id: string;
  payload: UpdateTransactionPayload;
};

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateVariables) => updateTransaction(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: transactionsQueryKey });

      const previous = queryClient.getQueriesData<TransactionListResponse>({
        queryKey: transactionsQueryKey,
      });

      queryClient.setQueriesData<TransactionListResponse>(
        { queryKey: transactionsQueryKey },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((tx) =>
              tx.id === id
                ? {
                    ...tx,
                    ...payload,
                  }
                : tx,
            ),
          };
        },
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      context?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionsQueryKey,
        refetchType: "active",
      });
    },
  });
}
