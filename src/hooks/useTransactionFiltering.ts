import { useMemo } from "react";
import { parseFilters } from "../filters/filters.parser";
import { applyFilters } from "../filters/filters.applier";
import type { Transaction } from "../types/transaction";
import { validateFilters, applySorting } from "../utils";
import type { TransactionFilters as TransactionFiltersType } from "../types/transactionFilters";
import { hasActiveFilters } from "../utils/presetUtils";

interface UseTransactionFilteringReturn {
  filters: TransactionFiltersType;
  validation: ReturnType<typeof validateFilters>;
  hasActiveFilters: boolean;
  filteredTransactions: Transaction[];
  sortedTransactions: Transaction[];
  sorting: { key: keyof Transaction; direction: "asc" | "desc" } | null;
}

interface UseTransactionFilteringParams {
  searchParams: URLSearchParams;
  data: Transaction[];
}

export const useTransactionFiltering = ({
  searchParams,
  data,
}: UseTransactionFilteringParams): UseTransactionFilteringReturn => {
  const filters = parseFilters(searchParams);
  const validation = useMemo(() => validateFilters(filters), [filters]);

  const activeFilters = hasActiveFilters(filters);

  const filteredTransactions = useMemo(
    () => (validation.valid ? applyFilters(data, filters) : data),
    [validation, filters, data],
  );

  const sortKey = searchParams.get("sort") as keyof Transaction | null;
  const direction = searchParams.get("dir") as "asc" | "desc" | null;
  const sorting = sortKey && direction ? { key: sortKey, direction } : null;

  const sortedTransactions = useMemo(
    () => applySorting(filteredTransactions, sorting),
    [filteredTransactions, sorting],
  );

  return {
    filters,
    validation,
    hasActiveFilters: activeFilters,
    filteredTransactions,
    sortedTransactions,
    sorting,
  };
};
