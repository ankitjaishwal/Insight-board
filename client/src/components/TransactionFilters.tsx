import { useMemo, useState } from "react";
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
  onDeletePreset?: () => void;
  onRenamePreset?: (renameValue: string, closeModal: () => void) => void;
  hasActiveFilters?: boolean;
  isPresetDirty?: boolean;
  hasActivePreset?: boolean;
  onClearFilters?: () => void;
};

type FocusedDateField = "from" | "to" | null;
type FocusedAmountField = "minAmount" | "maxAmount" | null;

const TransactionFilters: React.FC<Props> = ({
  searchParams,
  setSearchParams,
  validationErrors = {},
  presets = [],
  activePresetId = null,
  onSelectPreset = () => {},
  onSelectCustom = () => {},
  onSavePreset = () => {},
  onDeletePreset = () => {},
  onRenamePreset = () => {},
  hasActiveFilters = false,
  isPresetDirty = false,
  hasActivePreset = false,
  onClearFilters = () => {},
}) => {
  const { isAdvancedExpanded, setIsAdvancedExpanded, shouldShowAdvanced } =
    useFilterUI();

  const [lastFocusedDateField, setLastFocusedDateField] =
    useState<FocusedDateField>(null);
  const [lastFocusedAmountField, setLastFocusedAmountField] =
    useState<FocusedAmountField>(null);

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
      if (value.length > 0) next.set("search", value);
      else next.delete("search");
      return next;
    });
  };

  const updateStatus = (statusValue: string, checked: boolean) => {
    const currentStatuses = searchParams.get("status")
      ? searchParams.get("status")!.split(",")
      : [];
    const nextStatuses = checked
      ? currentStatuses.includes(statusValue)
        ? currentStatuses
        : [...currentStatuses, statusValue]
      : currentStatuses.filter((status) => status !== statusValue);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextStatuses.length > 0) {
        next.set("status", nextStatuses.join(","));
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

  const displayedValidationErrors = useMemo(() => {
    const errors: Record<string, string> = { ...validationErrors };

    const hasDateRangeError =
      errors.from && errors.to && errors.from === errors.to;
    if (hasDateRangeError) {
      if (lastFocusedDateField === "to") delete errors.from;
      else delete errors.to;
    }

    const hasAmountRangeError =
      errors.minAmount &&
      errors.maxAmount &&
      errors.minAmount === errors.maxAmount;
    if (hasAmountRangeError) {
      if (lastFocusedAmountField === "maxAmount") delete errors.minAmount;
      else delete errors.maxAmount;
    }

    return errors;
  }, [validationErrors, lastFocusedDateField, lastFocusedAmountField]);

  const hasValidationErrors = Object.values(validationErrors).some(Boolean);

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
          onDeletePreset={onDeletePreset}
          onRenamePreset={onRenamePreset}
          onClearFilters={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          isPresetDirty={isPresetDirty}
          hasActivePreset={hasActivePreset}
          validationErrors={displayedValidationErrors}
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
                onFocus={() => setLastFocusedDateField("from")}
                error={displayedValidationErrors.from}
                type="date"
                id="from"
              />
              <FilterFieldRow
                label="To"
                value={to}
                onChange={(value) => updateDateRange("to", value)}
                onFocus={() => setLastFocusedDateField("to")}
                error={displayedValidationErrors.to}
                type="date"
                id="to"
              />
            </div>

            <div className="flex gap-1.5 items-start flex-1">
              <FilterFieldRow
                label="Min"
                value={minAmount}
                onChange={(value) => updateAmountRange("min", value)}
                onFocus={() => setLastFocusedAmountField("minAmount")}
                error={displayedValidationErrors.minAmount}
                placeholder="0"
                type="number"
                id="minAmount"
              />
              <FilterFieldRow
                label="Max"
                value={maxAmount}
                onChange={(value) => updateAmountRange("max", value)}
                onFocus={() => setLastFocusedAmountField("maxAmount")}
                error={displayedValidationErrors.maxAmount}
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
