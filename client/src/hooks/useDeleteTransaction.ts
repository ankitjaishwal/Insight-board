import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
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

      queryClient.setQueriesData<TransactionListResponse | InfiniteData<TransactionListResponse>>(
        { queryKey: transactionsQueryKey },
        (old) => {
          if (!old) return old;

          if ("pages" in old) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.filter((tx) => tx.id !== id),
              })),
            };
          }

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
