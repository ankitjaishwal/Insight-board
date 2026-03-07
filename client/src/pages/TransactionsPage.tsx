import { useOutletContext, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { TableSkeleton } from "../components/LoadingSkeletons";

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
  const {
    data,
    meta,
    limit,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    filters,
    validation,
    hasActiveFilters,
    sorting,
  } = useTransactionQuery(searchParams);

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
  const total = meta?.total ?? 0;
  const hasLoadedAnyRows = data.length > 0;

  useEffect(() => {
    if (searchParams.has("page")) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("page");
        return next;
      });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {activeRoute.label}
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              exportToCSV(data, columns, `transactions-${Date.now()}.csv`)
            }
            disabled={!data.length}
            className="ui-button-secondary"
          >
            ⬇ Export CSV
          </button>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="ui-button-primary"
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
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Loading means query is still in-flight. Empty means request finished but no matches. */}
          {isLoading ? (
            <TableSkeleton rows={8} columns={6} />
          ) : data.length === 0 ? (
            <div className="ui-empty-state">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                No transactions found
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try adjusting filters or create a new transaction.
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <DataTable<Transaction>
                columns={columns}
                data={data}
                sorting={sorting}
                onSort={handleSorting}
                getRowId={(row) => row.id ?? row.transactionId}
                maxHeightClassName="max-h-[calc(100vh-360px)]"
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
                onReachEnd={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                canLoadMore={!!hasNextPage}
                isLoadingMore={isFetchingNextPage}
              />
            </div>
          )}

          {!hasNextPage && !isLoading && hasLoadedAnyRows && (
            <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              No more results
            </p>
          )}

          <div className="surface-card mt-3 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-700 dark:text-slate-200">
              Total: {total}
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="page-size"
                className="text-sm text-slate-600 dark:text-slate-300"
              >
                Rows per page
              </label>
              <select
                id="page-size"
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("limit", String(newLimit));
                    next.delete("page");
                    return next;
                  });
                }}
                className="ui-select"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </ErrorBoundary>

      {isFetching && !isLoading && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Refreshing transactions...
        </p>
      )}
      {isError && (
        <p className="text-sm text-red-600 mt-3">Failed to load transactions</p>
      )}

      {showSaveModal && (
        <div className="ui-modal-backdrop">
          <div className="ui-modal-card max-w-md">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Save Filter Preset
            </h3>

            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSavePreset(presetName);
              }}
              placeholder="e.g., Completed Today"
              className="ui-input mb-4 w-full"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setPresetName("");
                }}
                className="ui-button-secondary"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSavePreset(presetName)}
                disabled={!presetName.trim() || isCreatingPreset}
                className="ui-button-primary"
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
