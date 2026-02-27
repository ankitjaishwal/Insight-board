export type OverviewMetricKey =
  | "totalUsers"
  | "totalTransactions"
  | "totalRevenue"
  | "successRate"
  | "failedCount"
  | "pendingCount"
  | "averageTransactionValue";

type OverviewMetricDefinition = {
  label: string;
  format?: (value: number) => string;
};

export const overviewMetricRegistry: Record<
  OverviewMetricKey,
  OverviewMetricDefinition
> = {
  totalUsers: { label: "Total Users" },
  totalTransactions: { label: "Total Transactions" },
  totalRevenue: {
    label: "Total Revenue",
    format: (value) => `₹${value.toLocaleString()}`,
  },
  successRate: {
    label: "Success Rate",
    format: (value) => `${value.toFixed(1)}%`,
  },
  failedCount: { label: "Failed Transactions" },
  pendingCount: { label: "Pending Transactions" },
  averageTransactionValue: {
    label: "Avg Transaction Value",
    format: (value) => `₹${value.toFixed(2)}`,
  },
};
