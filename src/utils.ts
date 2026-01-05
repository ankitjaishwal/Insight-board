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
