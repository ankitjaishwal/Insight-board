import { Status, type Transaction } from "./types/transaction";

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

export const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const dayNum = date.getDate();
  const monthName = date.toLocaleString("en-US", { month: "short" });
  const yearNum = date.getFullYear();

  return `${dayNum} ${monthName} ${yearNum}`;
};

export function applySorting(
  data: Transaction[],
  sorting: { key: keyof Transaction; direction: "asc" | "desc" } | null,
): Transaction[] {
  if (!sorting) return data;

  const { key, direction } = sorting;

  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    let comparison = 0;

    if (key === "date") {
      comparison =
        new Date(aVal as string).getTime() - new Date(bVal as string).getTime();
    } else if (typeof aVal === "number" && typeof bVal === "number") {
      comparison = aVal - bVal;
    } else if (typeof aVal === "string" && typeof bVal === "string") {
      comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
    }

    return direction === "asc" ? comparison : -comparison;
  });
}

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

export const statusToParam: Record<Status, string> = {
  [Status.Completed]: "completed",
  [Status.Pending]: "pending",
  [Status.Failed]: "failed",
};

export const paramToStatus: Record<string, Status> = {
  completed: Status.Completed,
  pending: Status.Pending,
  failed: Status.Failed,
};
