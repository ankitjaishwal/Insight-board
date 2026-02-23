import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateTransaction } from "../../hooks/useCreateTransaction";
import {
  createTransactionSchema,
  type CreateTransactionFormValues,
} from "../../forms/transactionCrud.schema";
import { useToast } from "../../context/ToastContext";
import { TransactionApiError } from "../../api/transactionApi";

type TransactionCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TransactionCreateModal({
  isOpen,
  onClose,
}: TransactionCreateModalProps) {
  const createMutation = useCreateTransaction();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateTransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      userName: "",
      amount: undefined,
      date: new Date().toISOString(),
      status: "PENDING",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: CreateTransactionFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      showToast("Transaction created", "success");
      reset();
      onClose();
    } catch (error) {
      const message =
        error instanceof TransactionApiError
          ? error.message
          : "Failed to create transaction";
      showToast(message, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-md">
        <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="create-user-name"
              className="block text-sm text-gray-700 mb-1"
            >
              User Name
            </label>
            <input
              id="create-user-name"
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
              htmlFor="create-amount"
              className="block text-sm text-gray-700 mb-1"
            >
              Amount
            </label>
            <input
              id="create-amount"
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
              htmlFor="create-date"
              className="block text-sm text-gray-700 mb-1"
            >
              Date (ISO)
            </label>
            <input
              id="create-date"
              {...register("date")}
              placeholder="2026-01-15T10:00:00.000Z"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && (
              <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="create-status"
              className="block text-sm text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="create-status"
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

          {createMutation.error && (
            <p className="text-xs text-red-600">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "Request failed"}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending || isSubmitting}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || isSubmitting
                ? "Creating..."
                : "Create Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
