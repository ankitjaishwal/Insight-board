import type { MetricKey } from "../registry/metricRegistry";
import type { Role } from "../types/role";

export type RouteConfig = {
  key: "overview" | "transactions";
  label: string;
  path: string;
  roles?: Role[];
};

export type DashboardConfig = {
  appName: string;
  currency: "INR" | "USD";
  routes: Array<RouteConfig>;

  overview: {
    kpis: Array<{
      key: MetricKey;
      roles?: Role[];
    }>;

    chart: "statusBreakdown";
  };
};
