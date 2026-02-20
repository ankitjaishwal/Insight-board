import { useState } from "react";
import { Status } from "../types/transaction";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: (
    nextInit: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  ) => void;
  validationErrors?: Record<string, string>;
};

const TransactionFilters: React.FC<Props> = ({
  searchParams,
  setSearchParams,
  validationErrors = {},
}) => {
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const minAmount = searchParams.get("min") || "";
  const maxAmount = searchParams.get("max") || "";

  const selectedStatuses = statusParam ? statusParam.split(",") : [];

  const hasAdvancedFilters = Boolean(from || to || minAmount || maxAmount);
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const shouldShowAdvanced = isAdvancedExpanded || hasAdvancedFilters;

  const updateSearch = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value.trim()) next.set("search", value);
      else next.delete("search");
      return next;
    });
  };

  const updateStatus = (statusValue: string, checked: boolean) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const statuses = next.get("status") ? next.get("status")!.split(",") : [];

      if (checked) {
        if (!statuses.includes(statusValue)) {
          statuses.push(statusValue);
        }
      } else {
        const index = statuses.indexOf(statusValue);
        if (index > -1) statuses.splice(index, 1);
      }

      if (statuses.length > 0) {
        next.set("status", statuses.join(","));
      } else {
        next.delete("status");
      }
      return next;
    });
  };

  const updateDateRange = (field: "from" | "to", value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(field, value);
      else next.delete(field);
      return next;
    });
  };

  const updateAmountRange = (field: "min" | "max", value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value && !isNaN(Number(value))) next.set(field, value);
      else next.delete(field);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setIsAdvancedExpanded(false);
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative">
          <input
            id="search"
            name="search"
            type="text"
            aria-label="Search transactions"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search by user/ID"
            className="border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              type="button"
              onClick={() => updateSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-base leading-none"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
            Status:
          </span>
          <div className="flex gap-3">
            {[Status.Completed, Status.Pending, Status.Failed].map((status) => (
              <label
                key={status}
                className="flex items-center gap-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status)}
                  onChange={(e) => updateStatus(status, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          className={`px-3 py-2 text-sm font-medium flex items-center gap-1 rounded transition ${
            hasValidationErrors
              ? "text-red-600 hover:text-red-700 hover:bg-red-50 bg-red-50 border border-red-200"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
          }`}
        >
          {hasValidationErrors && <span className="text-lg">⚠</span>}
          Advanced {shouldShowAdvanced ? "▴" : "▾"}
        </button>
        <button
          onClick={clearAllFilters}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded text-sm transition whitespace-nowrap"
        >
          Clear
        </button>
      </div>

      {shouldShowAdvanced && (
        <div className="mt-3 border-t border-gray-300 pt-3">
          <div className="flex gap-3 items-end">
            <div className="flex gap-1.5 items-start flex-1">
              <div className="flex-1">
                <label
                  htmlFor="from"
                  className="block text-xs text-gray-600 mb-0.5 font-medium"
                >
                  From
                </label>
                <input
                  id="from"
                  type="date"
                  value={from}
                  onChange={(e) => updateDateRange("from", e.target.value)}
                  className={`w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 ${
                    validationErrors.from
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <div className="h-4 mt-0.5">
                  {validationErrors.from && (
                    <p className="text-xs text-red-600 flex items-center gap-0.5">
                      <span>⚠</span>
                      {validationErrors.from}
                    </p>
                  )}
                  {!validationErrors.from && validationErrors.to && (
                    <p className="text-xs text-gray-400">Start date</p>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="to"
                  className="block text-xs text-gray-600 mb-0.5 font-medium"
                >
                  To
                </label>
                <input
                  id="to"
                  type="date"
                  value={to}
                  onChange={(e) => updateDateRange("to", e.target.value)}
                  className={`w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 ${
                    validationErrors.to
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <div className="h-4 mt-0.5">
                  {validationErrors.to && (
                    <p className="text-xs text-red-600 flex items-center gap-0.5">
                      <span>⚠</span>
                      {validationErrors.to}
                    </p>
                  )}
                  {!validationErrors.to && validationErrors.from && (
                    <p className="text-xs text-gray-400">End date</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 items-start flex-1">
              <div className="flex-1">
                <label
                  htmlFor="minAmount"
                  className="block text-xs text-gray-600 mb-0.5 font-medium"
                >
                  Min
                </label>
                <input
                  id="minAmount"
                  type="number"
                  value={minAmount}
                  onChange={(e) => updateAmountRange("min", e.target.value)}
                  placeholder="0"
                  className={`w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 ${
                    validationErrors.minAmount
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <div className="h-4 mt-0.5">
                  {validationErrors.minAmount && (
                    <p className="text-xs text-red-600 flex items-center gap-0.5">
                      <span>⚠</span>
                      {validationErrors.minAmount}
                    </p>
                  )}
                  {!validationErrors.minAmount &&
                    validationErrors.maxAmount && (
                      <p className="text-xs text-gray-400">Minimum</p>
                    )}
                </div>
              </div>
              <div className="flex-1">
                <label
                  htmlFor="maxAmount"
                  className="block text-xs text-gray-600 mb-0.5 font-medium"
                >
                  Max
                </label>
                <input
                  id="maxAmount"
                  type="number"
                  value={maxAmount}
                  onChange={(e) => updateAmountRange("max", e.target.value)}
                  placeholder="0"
                  className={`w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 ${
                    validationErrors.maxAmount
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <div className="h-4 mt-0.5">
                  {validationErrors.maxAmount && (
                    <p className="text-xs text-red-600 flex items-center gap-0.5">
                      <span>⚠</span>
                      {validationErrors.maxAmount}
                    </p>
                  )}
                  {!validationErrors.maxAmount &&
                    validationErrors.minAmount && (
                      <p className="text-xs text-gray-400">Maximum</p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;
