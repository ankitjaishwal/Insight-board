import { formatDate } from "../utils";
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
    <div className="mb-4 flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Active:</span>
      {filters.search && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
          <span>"{filters.search}"</span>
          <button
            onClick={() => onRemoveFilter("search")}
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Remove search filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.status && filters.status.length > 0 && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
          <span>{filters.status.join(" · ")}</span>
          <button
            onClick={() => onRemoveFilter("status")}
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Remove status filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.from && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
          <span>From {formatDate(filters.from)}</span>
          <button
            onClick={() => onRemoveFilter("from")}
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Remove from date filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.to && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
          <span>To {formatDate(filters.to)}</span>
          <button
            onClick={() => onRemoveFilter("to")}
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Remove to date filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.minAmount !== undefined && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
          <span>Min ₹{filters.minAmount.toLocaleString()}</span>
          <button
            onClick={() => onRemoveFilter("minAmount")}
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Remove min amount filter"
          >
            ✕
          </button>
        </span>
      )}

      {filters.maxAmount !== undefined && (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700">
          <span>Max ₹{filters.maxAmount.toLocaleString()}</span>
          <button
            onClick={() => onRemoveFilter("maxAmount")}
            className="ml-1 text-gray-400 hover:text-gray-600"
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
