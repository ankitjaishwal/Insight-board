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
