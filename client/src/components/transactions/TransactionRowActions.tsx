import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const canEdit = user?.role === "ADMIN" || user?.role === "OPS";
  const canDelete = user?.role === "ADMIN";

  if (!canEdit && !canDelete) {
    return <span className="text-slate-400 dark:text-slate-500">-</span>;
  }

  const hasId = !!transaction.id;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label="Transaction actions"
        onClick={() => setOpen((prev) => !prev)}
        className="ui-button-secondary px-2 py-1"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-28 rounded-lg border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900">
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit(transaction);
              }}
              disabled={!hasId}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 dark:hover:bg-slate-800 dark:disabled:text-slate-500"
            >
              Edit
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(transaction);
              }}
              disabled={!hasId}
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:text-red-300 dark:hover:bg-red-500/10 dark:disabled:text-slate-500"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
