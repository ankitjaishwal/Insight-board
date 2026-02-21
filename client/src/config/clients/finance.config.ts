import type { DashboardConfig } from "../app.config";

export const financeConfig: DashboardConfig = {
  appName: "Finance Dashboard",
  currency: "USD",

  routes: [
    { key: "overview", label: "Summary", path: "overview" },
    {
      key: "transactions",
      label: "Payments",
      path: "transactions",
    },
  ],

  overview: {
    kpis: [
      { key: "totalUsers", roles: ["ops", "admin"] },
      { key: "totalRevenue", roles: ["finance", "admin"] },
      { key: "successRate" },
    ],
    chart: "statusBreakdown",
  },
};
