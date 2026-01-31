import type { Transaction } from "../types";

export const metricRegistry = {
  totalUsers: {
    label: "Total Users",
    derive: (transactions: Transaction[]) =>
      new Set(transactions.map((t) => t.user)).size,
  },

  totalRevenue: {
    label: "Total Revenue",
    derive: (transactions: Transaction[]) =>
      transactions
        .filter((t) => t.status === "Completed")
        .reduce((sum, t) => sum + t.amount, 0),
  },

  totalTransactions: {
    label: "Total Transactions",
    derive: (transactions: Transaction[]) => transactions.length,
  },

  successRate: {
    label: "Success Rate",
    derive: (transactions: Transaction[]) => {
      const completed = transactions.filter(
        (t) => t.status === "Completed",
      ).length;
      return transactions.length === 0
        ? 0
        : (completed / transactions.length) * 100;
    },
  },
} as const;
