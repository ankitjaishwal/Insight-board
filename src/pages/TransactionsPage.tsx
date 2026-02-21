import { useOutletContext, useSearchParams } from "react-router-dom";
import TransactionFilters from "../components/TransactionFilters";
import ActiveFiltersSummary from "../components/ActiveFiltersSummary";
import { transactions } from "../mocks/transactions.mock";
import type { Transaction } from "../types/transaction";
import { formatDate } from "../utils";
import type { RouteConfig } from "../config/app.config";
import type { TransactionFilters as TransactionFiltersType } from "../types/transactionFilters";
import DataTable from "../components/DataTable";
import type { Column } from "../types/table";
import { usePresets } from "../hooks/usePresets";
import { useTransactionFiltering } from "../hooks/useTransactionFiltering";
import { exportToCSV } from "../utils/exportCsv";

const columns: Column<Transaction>[] = [
  { key: "transactionId", header: "Transaction ID", sortable: true },
  { key: "user", header: "User" },
  { key: "status", header: "Status" },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (value) => `$${value}`,
    sortable: true,
  },
  {
    key: "date",
    header: "Date",
    render: (value) => formatDate(value as string),
    sortable: true,
  },
];

const TransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { filters, validation, hasActiveFilters, sortedTransactions, sorting } =
    useTransactionFiltering({
      searchParams,
      data: transactions,
    });

  const {
    presets,
    activePresetId,
    activePreset,
    isPresetDirty,
    showSaveModal,
    presetName,
    setShowSaveModal,
    setPresetName,
    handleSavePreset,
    handlePresetAction,
    handleApplyPreset,
    handleSelectCustom,
    handleDeletePreset,
    handleRenamePreset,
  } = usePresets(filters);

  const handleSorting = (key: keyof Transaction) => {
    setSearchParams((prev) => {
      const currentSort = prev.get("sort");
      const currentDir = prev.get("dir") as "asc" | "desc" | null;

      let newDir: "asc" | "desc" | null;

      if (currentSort !== key) {
        newDir = "asc";
      } else if (currentDir === "asc") {
        newDir = "desc";
      } else if (currentDir === "desc") {
        newDir = null;
      } else {
        newDir = "asc";
      }

      const next = new URLSearchParams(prev);

      if (newDir) {
        next.set("sort", key);
        next.set("dir", newDir);
      } else {
        next.delete("sort");
        next.delete("dir");
      }

      return next;
    });
  };

  const handleRemoveFilter = (filterKey: keyof TransactionFiltersType) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const filterMap: Record<keyof TransactionFiltersType, string> = {
        search: "search",
        status: "status",
        from: "from",
        to: "to",
        minAmount: "min",
        maxAmount: "max",
      };
      next.delete(filterMap[filterKey]);
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const { activeRoute } = useOutletContext<{ activeRoute: RouteConfig }>();

  const filename = `transactions-${Date.now()}.csv`;

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl text-gray-900 font-semibold">
          {activeRoute.label}
        </h1>

        <button
          onClick={() => exportToCSV(sortedTransactions, columns, filename)}
          disabled={!sortedTransactions.length}
          className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬇ Export CSV
        </button>
      </div>

      <ActiveFiltersSummary
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
      />

      <TransactionFilters
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        validationErrors={validation.errors}
        presets={presets}
        activePresetId={activePresetId}
        onSelectPreset={(preset) => handleApplyPreset(preset, setSearchParams)}
        onSelectCustom={handleSelectCustom}
        onSavePreset={handlePresetAction}
        onDeletePreset={handleDeletePreset}
        onRenamePreset={handleRenamePreset}
        hasActiveFilters={hasActiveFilters}
        isPresetDirty={isPresetDirty}
        hasActivePreset={!!activePreset}
        onClearFilters={handleClearFilters}
      />

      <DataTable<Transaction>
        columns={columns}
        data={sortedTransactions}
        sorting={sorting}
        onSort={handleSorting}
        getRowId={(row) => row.transactionId}
      />

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>

            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSavePreset(presetName);
              }}
              placeholder="e.g., Completed Today"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setPresetName("");
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSavePreset(presetName)}
                disabled={!presetName.trim()}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionsPage;
