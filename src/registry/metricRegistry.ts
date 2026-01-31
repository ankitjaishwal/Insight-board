import type { Transaction } from "../types";
import { Status } from "../types/transaction";

export const metricRegistry = {
  totalUsers: {
    label: "Total Users",
    derive: (transactions: Transaction[]) => {
      return new Set(transactions.map((t) => t.user)).size;
    },
  },

  totalRevenue: {
    label: "Total Revenue",
    derive: (transactions: Transaction[]) => {
      return transactions
        .filter((t) => t.status === Status.Completed)
        .reduce((sum, t) => sum + t.amount, 0);
    },
  },

  totalTransactions: {
    label: "Total Transactions",
    derive: (transactions: Transaction[]) => {
      return transactions.length;
    },
  },

  successRate: {
    label: "Success Rate",
    derive: (transactions: Transaction[]) => {
      if (transactions.length === 0) return 0;

      const completed = transactions.filter(
        (t) => t.status === Status.Completed,
      ).length;

      return (completed / transactions.length) * 100;
    },
  },
} as const;

export type MetricKey = keyof typeof metricRegistry;

export type Metrics = {
  [K in MetricKey]: ReturnType<(typeof metricRegistry)[K]["derive"]>;
};
