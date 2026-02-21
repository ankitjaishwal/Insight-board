import { useRef } from "react";
import { useFilterUI } from "../hooks/useFilterUI";
import { FilterFieldRow } from "./FilterFieldRow";
import { StatusCheckboxes } from "./StatusCheckboxes";
import { PresetToolbar } from "./PresetToolbar";
import type { FilterPreset } from "../types/preset";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: (
    nextInit: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  ) => void;
  validationErrors?: Record<string, string>;
  presets?: FilterPreset[];
  activePresetId?: string | null;
  onSelectPreset?: (preset: FilterPreset) => void;
  onSelectCustom?: () => void;
  onSavePreset?: () => void;
  hasActiveFilters?: boolean;
  isPresetDirty?: boolean;
  hasActivePreset?: boolean;
  onClearFilters?: () => void;
};

const TransactionFilters: React.FC<Props> = ({
  searchParams,
  setSearchParams,
  validationErrors = {},
  presets = [],
  activePresetId = null,
  onSelectPreset = () => {},
  onSelectCustom = () => {},
  onSavePreset = () => {},
  hasActiveFilters = false,
  isPresetDirty = false,
  hasActivePreset = false,
  onClearFilters = () => {},
}) => {
  const { isAdvancedExpanded, setIsAdvancedExpanded, shouldShowAdvanced } =
    useFilterUI();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const minAmount = searchParams.get("min") || "";
  const maxAmount = searchParams.get("max") || "";

  const selectedStatuses = statusParam ? statusParam.split(",") : [];
  const hasAdvancedFilters = Boolean(from || to || minAmount || maxAmount);

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
    onClearFilters();
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative">
          <input
            ref={searchInputRef}
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

        <StatusCheckboxes
          selectedStatuses={selectedStatuses}
          onChange={updateStatus}
        />

        <button
          onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          className={`px-3 py-2 text-sm font-medium flex items-center gap-1 rounded transition ${
            hasValidationErrors
              ? "text-red-600 hover:text-red-700 hover:bg-red-50 bg-red-50 border border-red-200"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
          }`}
        >
          {hasValidationErrors && <span className="text-lg">⚠</span>}
          Advanced {shouldShowAdvanced(hasAdvancedFilters) ? "▴" : "▾"}
        </button>

        <PresetToolbar
          presets={presets}
          activePresetId={activePresetId}
          onSelectPreset={onSelectPreset}
          onSelectCustom={onSelectCustom}
          onSavePreset={onSavePreset}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          isPresetDirty={isPresetDirty}
          hasActivePreset={hasActivePreset}
          validationErrors={validationErrors}
        />
      </div>

      {shouldShowAdvanced(hasAdvancedFilters) && (
        <div className="mt-3 border-t border-gray-300 pt-3">
          <div className="flex gap-3 items-end">
            <div className="flex gap-1.5 items-start flex-1">
              <FilterFieldRow
                label="From"
                value={from}
                onChange={(value) => updateDateRange("from", value)}
                error={validationErrors.from}
                type="date"
                id="from"
              />
              <FilterFieldRow
                label="To"
                value={to}
                onChange={(value) => updateDateRange("to", value)}
                error={validationErrors.to}
                type="date"
                id="to"
              />
            </div>

            <div className="flex gap-1.5 items-start flex-1">
              <FilterFieldRow
                label="Min"
                value={minAmount}
                onChange={(value) => updateAmountRange("min", value)}
                error={validationErrors.minAmount}
                placeholder="0"
                type="number"
                id="minAmount"
              />
              <FilterFieldRow
                label="Max"
                value={maxAmount}
                onChange={(value) => updateAmountRange("max", value)}
                error={validationErrors.maxAmount}
                placeholder="0"
                type="number"
                id="maxAmount"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;
