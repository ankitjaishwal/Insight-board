import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Transaction } from "../../types/transaction";
import { useUpdateTransaction } from "../../hooks/useUpdateTransaction";
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from "../../forms/transactionCrud.schema";
import { useToast } from "../../context/ToastContext";
import { TransactionApiError } from "../../api/transactionApi";

type TransactionEditModalProps = {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
};

export default function TransactionEditModal({
  isOpen,
  transaction,
  onClose,
}: TransactionEditModalProps) {
  const updateMutation = useUpdateTransaction();
  const { showToast } = useToast();

  const defaultValues = useMemo<CreateTransactionFormValues | undefined>(() => {
    if (!transaction) return undefined;

    const status =
      transaction.status === "Pending"
        ? "PENDING"
        : transaction.status === "Completed"
          ? "COMPLETED"
          : transaction.status === "Failed"
            ? "FAILED"
            : (transaction.status as "PENDING" | "COMPLETED" | "FAILED");

    return {
      userName: transaction.userName,
      amount: transaction.amount,
      date: transaction.date,
      status,
    };
  }, [transaction]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    values: defaultValues,
  });

  const values = watch();

  const hasChanges =
    !!transaction &&
    (values.userName !== transaction.userName ||
      values.amount !== transaction.amount ||
      values.date !== transaction.date ||
      values.status !==
        (transaction.status === "Pending"
          ? "PENDING"
          : transaction.status === "Completed"
            ? "COMPLETED"
            : transaction.status === "Failed"
              ? "FAILED"
              : transaction.status));

  if (!isOpen || !transaction) return null;

  const onSubmit = async (formValues: CreateTransactionFormValues) => {
    if (!transaction.id || !hasChanges) return;

    try {
      await updateMutation.mutateAsync({
        id: transaction.id,
        payload: formValues,
      });
      showToast("Transaction updated", "success");
      onClose();
    } catch (error) {
      const message =
        error instanceof TransactionApiError
          ? error.message
          : "Failed to update transaction";
      showToast(message, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Transaction</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="edit-user-name"
              className="block text-sm text-gray-700 mb-1"
            >
              User Name
            </label>
            <input
              id="edit-user-name"
              {...register("userName")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.userName && (
              <p className="text-xs text-red-600 mt-1">
                {errors.userName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-amount"
              className="block text-sm text-gray-700 mb-1"
            >
              Amount
            </label>
            <input
              id="edit-amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.amount && (
              <p className="text-xs text-red-600 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-date"
              className="block text-sm text-gray-700 mb-1"
            >
              Date (ISO)
            </label>
            <input
              id="edit-date"
              {...register("date")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="block text-sm text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="edit-status"
              {...register("status")}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
            {errors.status && (
              <p className="text-xs text-red-600 mt-1">
                {errors.status.message}
              </p>
            )}
          </div>

          {updateMutation.error && (
            <p className="text-xs text-red-600">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Request failed"}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending || isSubmitting}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasChanges || updateMutation.isPending || isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending || isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
