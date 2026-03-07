import { formatDate } from "../utils";
import { statusLabel, type Status } from "../types/transaction";
import type { TransactionFilters } from "../types/transactionFilters";

type Props = {
  filters: TransactionFilters;
  onRemoveFilter: (filterKey: keyof TransactionFilters) => void;
};

const ActiveFiltersSummary: React.FC<Props> = ({ filters, onRemoveFilter }) => {
  // Check if there are any active filters
  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status.length > 0) ||
    filters.from ||
    filters.to ||
    filters.minAmount !== undefined ||
    filters.maxAmount !== undefined;

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/30 dark:bg-blue-500/10">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Active:
      </span>
      {filters.search && (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>"{filters.search}"</span>
          <button
            onClick={() => onRemoveFilter("search")}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Remove search filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.status && filters.status.length > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>
            {filters.status
              .map((status) => statusLabel[status as Status] ?? status)
              .join(" · ")}
          </span>
          <button
            onClick={() => onRemoveFilter("status")}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Remove status filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.from && (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>From {formatDate(filters.from)}</span>
          <button
            onClick={() => onRemoveFilter("from")}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Remove from date filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.to && (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>To {formatDate(filters.to)}</span>
          <button
            onClick={() => onRemoveFilter("to")}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Remove to date filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.minAmount !== undefined && (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>Min ₹{filters.minAmount.toLocaleString()}</span>
          <button
            onClick={() => onRemoveFilter("minAmount")}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Remove min amount filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.maxAmount !== undefined && (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>Max ₹{filters.maxAmount.toLocaleString()}</span>
          <button
            onClick={() => onRemoveFilter("maxAmount")}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Remove max amount filter"
          >
            ✕
          </button>
        </span>
      )}
    </div>
  );
};

export default ActiveFiltersSummary;
