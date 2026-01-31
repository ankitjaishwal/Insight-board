export type RouteConfig = {
  key: "overview" | "transactions";
  label: string;
  path: string;
};

export type DashboardConfig = {
  appName: string;
  currency: "INR" | "USD";
  routes: Array<RouteConfig>;

  overview: {
    kpis: Array<
      "totalUsers" | "totalRevenue" | "totalTransactions" | "successRate"
    >;
    chart: "statusBreakdown";
  };
};

export const appConfig: DashboardConfig = {
  appName: "InsightBoard",
  currency: "INR",
  routes: [
    {
      key: "overview",
      label: "Overview",
      path: "/overview",
    },
    {
      key: "transactions",
      label: "Transactions",
      path: "/transactions",
    },
  ],

  overview: {
    kpis: ["totalUsers", "totalRevenue", "totalTransactions", "successRate"],
    chart: "statusBreakdown",
  },
};
