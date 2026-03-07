import { useNavigate } from "react-router-dom";
import type { DashboardConfig } from "../config/app.config";
import type { OverviewResponse } from "../api/overviewApi";
import { overviewMetricRegistry } from "../registry/overviewMetricRegistry";
import TrendChart from "./TrendChart";
import RecentTransactions from "./RecentTransactions";
import { chartRegistry } from "../registry/chartRegistry";

type OverviewMetricKey = keyof typeof overviewMetricRegistry;

const Overview = ({
  overview,
  config,
}: {
  overview: OverviewResponse;
  config: DashboardConfig;
}) => {
  const navigate = useNavigate();

  const chartConfig = chartRegistry[config.overview.chart];
  const ChartComponent = chartConfig.component;
  const chartData = chartConfig.deriveData(overview);

  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {(Object.keys(overviewMetricRegistry) as OverviewMetricKey[]).map(
          (key) => {
            const isPrimary = key === "totalRevenue";
            const metric = overviewMetricRegistry[key];
            const rawValue = overview[key];

            const numericValue =
              typeof rawValue === "number" && Number.isFinite(rawValue)
                ? rawValue
                : 0;

            const value = metric.format?.(numericValue) ?? numericValue;

            return (
              <div
                key={key}
                className={`cursor-pointer rounded-lg p-6 transition-all duration-200 ${
                  isPrimary
                    ? "bg-linear-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-xl"
                    : "border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                }`}
                onClick={() => navigate("/transactions")}
              >
                <p
                  className={`text-xs uppercase tracking-[0.2em] ${
                    isPrimary
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {metric.label}
                </p>

                <p
                  className={`mt-3 font-bold tracking-tight ${isPrimary ? "text-4xl" : "text-3xl text-slate-900 dark:text-slate-100"}`}
                >
                  {value}
                </p>
              </div>
            );
          },
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="surface-card lg:col-span-3">
          <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-slate-100">
            Last 7 Days Trend
          </h2>
          <TrendChart data={overview.last7DaysTransactions} />
        </div>

        <div className="surface-card">
          <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-slate-100">
            Recent Activity
          </h2>
          <RecentTransactions transactions={overview.recentTransactions} />
        </div>
      </div>

      <div className="surface-card">
        <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-slate-100">
          Status Breakdown
        </h2>

        <div className="mx-auto h-[260px] max-w-3xl">
          <ChartComponent data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
