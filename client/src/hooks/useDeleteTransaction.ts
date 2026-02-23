import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTransaction, type TransactionListResponse } from "../api/transactionApi";
import { transactionsQueryKey } from "./useTransactionQuery";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onMutate: async (id) => {
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
            data: old.data.filter((tx) => tx.id !== id),
          };
        },
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
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
