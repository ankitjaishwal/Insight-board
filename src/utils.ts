import type { Transaction } from "./types";

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
