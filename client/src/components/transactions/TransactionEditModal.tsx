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
import {
  TransactionApiError,
  type UpdateTransactionPayload,
} from "../../api/transactionApi";

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
        payload: formValues as unknown as UpdateTransactionPayload,
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
    <div className="ui-modal-backdrop">
      <div className="ui-modal-card">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Edit Transaction
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="edit-user-name"
              className="mb-1 block text-sm text-slate-700 dark:text-slate-200"
            >
              User Name
            </label>
            <input
              id="edit-user-name"
              {...register("userName")}
              className="ui-input w-full"
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
              className="mb-1 block text-sm text-slate-700 dark:text-slate-200"
            >
              Amount
            </label>
            <input
              id="edit-amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              className="ui-input w-full"
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
              className="mb-1 block text-sm text-slate-700 dark:text-slate-200"
            >
              Date (ISO)
            </label>
            <input
              id="edit-date"
              {...register("date")}
              className="ui-input w-full"
            />
            {errors.date && (
              <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="mb-1 block text-sm text-slate-700 dark:text-slate-200"
            >
              Status
            </label>
            <select
              id="edit-status"
              {...register("status")}
              className="ui-select w-full"
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
              className="ui-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasChanges || updateMutation.isPending || isSubmitting}
              className="ui-button-primary"
            >
              {updateMutation.isPending || isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
