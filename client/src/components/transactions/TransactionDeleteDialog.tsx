import type { Transaction } from "../../types/transaction";
import { useDeleteTransaction } from "../../hooks/useDeleteTransaction";
import { useToast } from "../../context/ToastContext";
import { TransactionApiError } from "../../api/transactionApi";

type TransactionDeleteDialogProps = {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
};

export default function TransactionDeleteDialog({
  isOpen,
  transaction,
  onClose,
}: TransactionDeleteDialogProps) {
  const deleteMutation = useDeleteTransaction();
  const { showToast } = useToast();

  if (!isOpen || !transaction) return null;

  const handleDelete = async () => {
    if (!transaction.id) return;

    try {
      await deleteMutation.mutateAsync(transaction.id);
      showToast("Transaction deleted", "success");
      onClose();
    } catch (error) {
      const message =
        error instanceof TransactionApiError
          ? error.message
          : "Failed to delete transaction";
      showToast(message, "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-104">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          Delete Transaction
        </h3>
        <p className="text-sm text-gray-700 mb-2">
          You are about to delete{" "}
          <span className="font-medium">{transaction.transactionId}</span>.
        </p>
        <p className="text-sm text-red-600 mb-5">
          This action is irreversible.
        </p>

        {deleteMutation.error && (
          <p className="text-xs text-red-600 mb-3">
            {deleteMutation.error instanceof Error
              ? deleteMutation.error.message
              : "Request failed"}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || !transaction.id}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
