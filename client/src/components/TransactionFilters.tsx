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
  isCreatingPreset?: boolean;
  isUpdatingPreset?: boolean;
  isDeletingPreset?: boolean;
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
  isCreatingPreset = false,
  isUpdatingPreset = false,
  isDeletingPreset = false,
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
    <div className="surface-panel mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative w-full sm:max-w-sm">
          <input
            id="search"
            name="search"
            type="text"
            aria-label="Search transactions"
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search by user/ID"
            className="ui-input w-full pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => updateSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base leading-none text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
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
          className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
            hasValidationErrors
              ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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
          isCreatingPreset={isCreatingPreset}
          isUpdatingPreset={isUpdatingPreset}
          isDeletingPreset={isDeletingPreset}
        />
      </div>

      {shouldShowAdvanced(hasAdvancedFilters) && (
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
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

            <div className="grid flex-1 gap-3 sm:grid-cols-2">
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
