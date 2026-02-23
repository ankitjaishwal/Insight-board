import { useOutletContext, useSearchParams } from "react-router-dom";
import { useState } from "react";
import TransactionFilters from "../components/TransactionFilters";
import ActiveFiltersSummary from "../components/ActiveFiltersSummary";
import type { Transaction } from "../types/transaction";
import { formatDate } from "../utils";
import type { RouteConfig } from "../config/app.config";
import type { TransactionFilters as TransactionFiltersType } from "../types/transactionFilters";
import DataTable from "../components/DataTable";
import type { Column } from "../types/table";
import { usePresets } from "../hooks/usePresets";
import { exportToCSV } from "../utils/exportCsv";
import { useTransactionQuery } from "../hooks/useTransactionQuery";
import { useAuth } from "../context/AuthContext";
import TransactionCreateModal from "../components/transactions/TransactionCreateModal";
import TransactionEditModal from "../components/transactions/TransactionEditModal";
import TransactionDeleteDialog from "../components/transactions/TransactionDeleteDialog";
import TransactionRowActions from "../components/transactions/TransactionRowActions";
import { ErrorBoundary } from "../components/errors/ErrorBoundary";

const columns: Column<Transaction>[] = [
  { key: "transactionId", header: "Transaction ID", sortable: true },
  { key: "userName", header: "User" },
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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const { data, isLoading, isError, filters, validation, hasActiveFilters, sorting } =
    useTransactionQuery(searchParams);

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
    isCreatingPreset,
    isUpdatingPreset,
    isDeletingPreset,
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
  const canCreate = user?.role === "ADMIN" || user?.role === "OPS";
  const canUseRowActions = user?.role === "ADMIN" || user?.role === "OPS";

  const filename = `transactions-${Date.now()}.csv`;

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl text-gray-900 font-semibold">
          {activeRoute.label}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(data, columns, filename)}
            disabled={!data.length}
            className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⬇ Export CSV
          </button>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              + Add Transaction
            </button>
          )}
        </div>
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
        isCreatingPreset={isCreatingPreset}
        isUpdatingPreset={isUpdatingPreset}
        isDeletingPreset={isDeletingPreset}
      />

      <ErrorBoundary fallbackMessage="Failed to render transactions table.">
        <div className="flex-1 min-h-0">
          <DataTable<Transaction>
            columns={columns}
            data={data}
            sorting={sorting}
            onSort={handleSorting}
            getRowId={(row) => row.id ?? row.transactionId}
            maxHeightClassName="max-h-full"
            rowActions={
              canUseRowActions
                ? (row) => (
                    <TransactionRowActions
                      transaction={row}
                      onEdit={setEditTarget}
                      onDelete={setDeleteTarget}
                    />
                  )
                : undefined
            }
          />
        </div>
      </ErrorBoundary>

      {isLoading && (
        <p className="text-sm text-gray-500 mt-3">Loading transactions...</p>
      )}
      {isError && (
        <p className="text-sm text-red-600 mt-3">Failed to load transactions</p>
      )}

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
                disabled={!presetName.trim() || isCreatingPreset}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCreatingPreset ? "Saving..." : "Save Preset"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ErrorBoundary fallbackMessage="Failed to render transaction create modal.">
        <TransactionCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </ErrorBoundary>

      <ErrorBoundary fallbackMessage="Failed to render transaction edit modal.">
        <TransactionEditModal
          isOpen={!!editTarget}
          transaction={editTarget}
          onClose={() => setEditTarget(null)}
        />
      </ErrorBoundary>

      <ErrorBoundary fallbackMessage="Failed to render transaction delete dialog.">
        <TransactionDeleteDialog
          isOpen={!!deleteTarget}
          transaction={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      </ErrorBoundary>
    </div>
  );
};

export default TransactionsPage;
