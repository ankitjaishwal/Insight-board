import type { DashboardConfig } from "../app.config";

export const opsConfig: DashboardConfig = {
  appName: "Ops Console",
  currency: "INR",

  routes: [
    { key: "overview", label: "Overview", path: "overview" },
    {
      key: "transactions",
      label: "Transactions",
      path: "transactions",
    },
    {
      key: "audit",
      label: "Audit Logs",
      path: "audit",
      roles: ["admin"],
    },
  ],

  overview: {
    kpis: [
      { key: "totalUsers", roles: ["ops", "admin"] },
      { key: "totalTransactions" },
      { key: "successRate" },
    ],
    chart: "statusBreakdown",
  },
};
