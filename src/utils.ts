import { type Transaction } from "./mocks/transactions.mock";

export interface Metrics {
  totalUsers: number;
  totalAmount: number;
  totalTransactions: number;
  successRate: number;
}

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
