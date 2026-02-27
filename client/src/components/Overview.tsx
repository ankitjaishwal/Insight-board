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
      {/* KPI GRID */}
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
                className={`rounded-xl p-6 transition-all duration-200 cursor-pointer ${
                  isPrimary
                    ? "bg-linear-to-br from-indigo-600 to-indigo-500 text-white shadow-lg"
                    : "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                }`}
                onClick={() => navigate("/transactions")}
              >
                <p
                  className={`text-xs uppercase tracking-wide ${
                    isPrimary ? "text-indigo-100" : "text-gray-500"
                  }`}
                >
                  {metric.label}
                </p>

                <p className="text-3xl font-bold mt-3">{value}</p>
              </div>
            );
          },
        )}
      </div>

      {/* Trend + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Trend */}
        <div className="xl:col-span-3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Last 7 Days Trend
          </h2>
          <TrendChart data={overview.last7DaysTransactions} />
        </div>

        {/* Recent */}
        <div className="xl:col-span-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Recent Activity
          </h2>
          <RecentTransactions transactions={overview.recentTransactions} />
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-5">
          Status Breakdown
        </h2>

        <div className="max-w-xl mx-auto h-[260px]">
          <ChartComponent data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Overview;
