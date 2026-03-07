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
    <div className="ui-modal-backdrop">
      <div className="ui-modal-card max-w-lg">
        <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Delete Transaction
        </h3>
        <p className="mb-2 text-sm text-slate-700 dark:text-slate-200">
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
            className="ui-button-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || !transaction.id}
            className="ui-button-danger"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
