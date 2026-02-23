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
    return <span className="text-gray-400">-</span>;
  }

  const hasId = !!transaction.id;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label="Transaction actions"
        onClick={() => setOpen((prev) => !prev)}
        className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded shadow-md z-30">
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit(transaction);
              }}
              disabled={!hasId}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
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
              className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
