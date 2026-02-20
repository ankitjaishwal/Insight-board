import type { Transaction } from "../types/transaction";
import type { TransactionFilters } from "./filters.types";

export function applyFilters(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  return transactions.filter((tx) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        tx.transactionId.toLowerCase().includes(searchLower) ||
        tx.user.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter (multi-select)
    if (filters.status && filters.status.length > 0) {
      const statusMatch = filters.status.includes(tx.status);
      if (!statusMatch) return false;
    }

    // Date range filter
    if (filters.from) {
      if (tx.date < filters.from) return false;
    }
    if (filters.to) {
      if (tx.date > filters.to) return false;
    }

    // Amount range filter
    if (filters.minAmount !== undefined) {
      if (tx.amount < filters.minAmount) return false;
    }
    if (filters.maxAmount !== undefined) {
      if (tx.amount > filters.maxAmount) return false;
    }

    return true;
  });
}
