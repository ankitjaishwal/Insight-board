import { useOutletContext, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import TransactionFilters from "../components/TransactionFilters";
import ActiveFiltersSummary from "../components/ActiveFiltersSummary";
import { transactions } from "../mocks/transactions.mock";
import type { Transaction } from "../types/transaction";
import { applySorting, deepEqual, formatDate, validateFilters } from "../utils";
import { parseFilters } from "../filters/filters.parser";
import { applyFilters } from "../filters/filters.applier";
import type { RouteConfig } from "../config/app.config";
import type { TransactionFilters as TransactionFiltersType } from "../types/transactionFilters";
import DataTable from "../components/DataTable";
import type { Column } from "../types/table";
import { presetService } from "../services/presetService";
import type { FilterPreset } from "../types/preset";

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
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const presetIdRef = useRef<string | null>(null);

  useEffect(() => {
    setPresets(presetService.getAll());
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();

  const filters = parseFilters(searchParams);
  const validation = useMemo(() => validateFilters(filters), [filters]);

  // On page load or preset list change, check if current filters match any preset
  useEffect(() => {
    if (activePresetId) return; // Already have an active preset
    if (presets.length === 0) return; // No presets available yet

    // Look for a preset that matches current filters
    const matchingPreset = presets.find((p) => deepEqual(filters, p.filters));

    if (matchingPreset) {
      setActivePresetId(matchingPreset.id);
      presetIdRef.current = matchingPreset.id;
    }
  }, [presets]);

  // Detect when filters change after preset application and clear activePresetId
  useEffect(() => {
    if (activePresetId && activePresetId === presetIdRef.current) {
      return;
    }

    if (activePresetId) {
      const activePreset = presets.find((p) => p.id === activePresetId);
      if (activePreset && !deepEqual(filters, activePreset.filters)) {
        setActivePresetId(null);
        presetIdRef.current = null;
      }
    }
  }, [filters, activePresetId, presets]);

  // Check if any filters are active (for Save button disable state)
  const hasActiveFilters = Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert("Preset name required");
      return;
    }

    const newPreset: FilterPreset = {
      id: crypto.randomUUID(),
      name: presetName.trim(),
      filters,
      createdAt: Date.now(),
    };

    presetService.save(newPreset);
    setPresets(presetService.getAll());
    setActivePresetId(newPreset.id);
    setPresetName("");
    setShowSaveModal(false);
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    // Reconstruct URL params from preset filters
    const newParams = new URLSearchParams();

    if (preset.filters.search) {
      newParams.set("search", preset.filters.search);
    }
    if (preset.filters.status && preset.filters.status.length > 0) {
      newParams.set("status", preset.filters.status.join(","));
    }
    if (preset.filters.from) {
      newParams.set("from", preset.filters.from);
    }
    if (preset.filters.to) {
      newParams.set("to", preset.filters.to);
    }
    if (preset.filters.minAmount !== undefined) {
      newParams.set("min", String(preset.filters.minAmount));
    }
    if (preset.filters.maxAmount !== undefined) {
      newParams.set("max", String(preset.filters.maxAmount));
    }

    setSearchParams(newParams);
    setActivePresetId(preset.id);
    presetIdRef.current = preset.id;
  };

  const handleSelectCustom = () => {
    setActivePresetId(null);
  };

  const filteredTransactions = validation.valid
    ? applyFilters(transactions, filters)
    : transactions;

  const sortKey = searchParams.get("sort") as keyof Transaction | null;
  const direction = searchParams.get("dir") as "asc" | "desc" | null;
  const sorting = sortKey && direction ? { key: sortKey, direction } : null;

  const sortedTransactions = applySorting(filteredTransactions, sorting);

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
      if (filterKey === "status") {
        next.delete("status");
      } else if (filterKey === "from") {
        next.delete("from");
      } else if (filterKey === "to") {
        next.delete("to");
      } else if (filterKey === "minAmount") {
        next.delete("min");
      } else if (filterKey === "maxAmount") {
        next.delete("max");
      } else if (filterKey === "search") {
        next.delete("search");
      }
      return next;
    });
  };

  const { activeRoute } = useOutletContext<{ activeRoute: RouteConfig }>();

  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">
        {activeRoute.label}
      </h1>

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
        onSelectPreset={handleApplyPreset}
        onSelectCustom={handleSelectCustom}
        onSavePreset={() => setShowSaveModal(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <DataTable<Transaction>
        columns={columns}
        data={sortedTransactions}
        sorting={sorting}
        onSort={handleSorting}
        getRowId={(row) => row.transactionId}
      />

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Save Filter Preset</h3>

            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSavePreset();
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
                onClick={handleSavePreset}
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
