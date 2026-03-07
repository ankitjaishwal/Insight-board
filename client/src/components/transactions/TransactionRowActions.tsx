import { useAuth } from "../../context/AuthContext";
import type { Transaction } from "../../types/transaction";

type TransactionRowActionsProps = {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export default function TransactionRowActions({
  transaction,
  onEdit,
  onDelete,
}: TransactionRowActionsProps) {
  const { user } = useAuth();

  const canEdit = user?.role === "ADMIN" || user?.role === "OPS";
  const canDelete = user?.role === "ADMIN";

  if (!canEdit && !canDelete) {
    return <span className="text-slate-400 dark:text-slate-500">-</span>;
  }

  const hasId = !!transaction.id;

  return (
    <div className="flex items-center justify-end gap-2">
      {canEdit && (
        <button
          type="button"
          aria-label="Edit transaction"
          title="Edit transaction"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(transaction);
          }}
          disabled={!hasId}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:disabled:text-slate-500"
        >
          ✎
        </button>
      )}

      {canDelete && (
        <button
          type="button"
          aria-label="Delete transaction"
          title="Delete transaction"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(transaction);
          }}
          disabled={!hasId}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:border-red-500/40 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-500/10 dark:disabled:border-slate-700 dark:disabled:text-slate-500"
        >
          🗑
        </button>
      )}
    </div>
  );
}
