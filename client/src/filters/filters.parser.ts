import { Status } from "../types/transaction";
import type { TransactionFilters } from "../types/transactionFilters";

/**
 * Parse URL search params into typed filter object.
 * No validation - just conversion.
 * Validation happens separately.
 */
export function parseFilters(
  searchParams: URLSearchParams,
): TransactionFilters {
  const filters: TransactionFilters = {};

  // Parse search
  const search = searchParams.get("search");
  if (search) {
    filters.search = search;
  }

  // Parse status (comma-separated)
  const statusParam = searchParams.get("status");
  if (statusParam) {
    const statuses = statusParam.split(",").filter(Boolean);

    // Optimization: If all statuses are selected, treat as undefined (no filtering)
    const allStatuses = [Status.Completed, Status.Pending, Status.Failed];
    const hasAllStatuses = allStatuses.every((s) => statuses.includes(s));

    if (!hasAllStatuses) {
      filters.status = statuses;
    }
  }

  // Parse date range (no validation, just parsing)
  const from = searchParams.get("from");
  if (from) {
    filters.from = from;
  }

  const to = searchParams.get("to");
  if (to) {
    filters.to = to;
  }

  // Parse amount range (no validation, just parsing)
  const minAmount = searchParams.get("min");
  if (minAmount && !isNaN(Number(minAmount))) {
    filters.minAmount = Number(minAmount);
  }

  const maxAmount = searchParams.get("max");
  if (maxAmount && !isNaN(Number(maxAmount))) {
    filters.maxAmount = Number(maxAmount);
  }

  return filters;
}
