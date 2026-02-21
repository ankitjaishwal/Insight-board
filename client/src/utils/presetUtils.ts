import type { TransactionFilters as TransactionFiltersType } from "../types/transactionFilters";

/**
 * Convert filter object to URL params
 */
export const filtersToParams = (
  filters: TransactionFiltersType,
): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.status && filters.status.length > 0) {
    params.set("status", filters.status.join(","));
  }
  if (filters.from) {
    params.set("from", filters.from);
  }
  if (filters.to) {
    params.set("to", filters.to);
  }
  if (filters.minAmount !== undefined) {
    params.set("min", String(filters.minAmount));
  }
  if (filters.maxAmount !== undefined) {
    params.set("max", String(filters.maxAmount));
  }

  return params;
};

/**
 * Check if filters have any active values
 */
export const hasActiveFilters = (filters: TransactionFiltersType): boolean => {
  return Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  });
};
