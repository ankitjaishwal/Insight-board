import type { Transaction } from "../types/transaction";

export type Filters = {
  search: string;
  status: string;
};

export const deriveStatusBreakdown = (transactions: Transaction[]) => {
  const breakdown: Record<string, number> = {};

  transactions.forEach((tx) => {
    breakdown[tx.status] = (breakdown[tx.status] || 0) + 1;
  });

  return breakdown;
};

export function applyTransactionFilters(
  data: Transaction[],
  filters: Filters,
): Transaction[] {
  const search = (filters.search || "").trim();

  return data.filter((t) => {
    const matchesSearch =
      !search ||
      t.transactionId.includes(search) ||
      t.user.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filters.status === "All" || t.status === filters.status;

    return matchesSearch && matchesStatus;
  });
}
