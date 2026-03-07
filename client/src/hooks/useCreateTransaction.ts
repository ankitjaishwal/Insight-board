import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction, type CreateTransactionPayload } from "../api/transactionApi";
import { transactionsQueryKey } from "./useTransactionQuery";
import { overviewQueryKey } from "./useOverviewQuery";
import { auditLogsQueryKey } from "./useAuditQuery";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => createTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionsQueryKey,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: overviewQueryKey,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: auditLogsQueryKey,
        refetchType: "active",
      });
    },
  });
}
