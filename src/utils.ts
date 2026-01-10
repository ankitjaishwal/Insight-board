import type { Metrics, Transaction } from "./types";

export const deriveMetrics = (transactions: Transaction[]): Metrics => {
  const totalUsers = new Set(transactions.map((tx) => tx.user)).size;
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (tx) => tx.status === "Completed"
  ).length;
  const totalAmount = transactions.reduce(
    (sum, tx) => (tx.status === "Completed" ? sum + tx.amount : sum),
    0
  );
  const successRate = totalTransactions
    ? (completedTransactions / totalTransactions) * 100
    : 0;

  return {
    totalUsers,
    totalTransactions,
    totalAmount,
    successRate,
  };
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
  sorting: { key: keyof Transaction; direction: "asc" | "desc" } | null
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
