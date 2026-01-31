import type { DashboardConfig } from "../app.config";

export const opsConfig: DashboardConfig = {
  appName: "Ops Console",
  currency: "INR",

  routes: [
    { key: "overview", label: "Overview", path: "/overview" },
    { key: "transactions", label: "Transactions", path: "/transactions" },
  ],

  overview: {
    kpis: ["totalUsers", "totalRevenue", "totalTransactions", "successRate"],
    chart: "statusBreakdown",
  },
};
