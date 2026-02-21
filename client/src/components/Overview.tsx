import { useNavigate } from "react-router-dom";
import MetricCard from "./MetricCard";
import { type DashboardConfig } from "../config/app.config";
import { metricRegistry } from "../registry/metricRegistry";
import { chartRegistry } from "../registry/chartRegistry";
import type { OverviewResponse } from "../api/overviewApi";

type OverviewMetricKey = Exclude<keyof OverviewResponse, "statusBreakdown">;

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
    <div className="mt-6">
      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-4">
        {config.overview.kpis.map(({ key: metricKey }) => {
          const metric = metricRegistry[metricKey];
          const key = metricKey as OverviewMetricKey;
          const metricVal = overview[key];
          const numericValue =
            typeof metricVal === "number" && Number.isFinite(metricVal)
              ? metricVal
              : 0;

          const value =
            metricKey === "totalRevenue"
              ? `₹${numericValue.toLocaleString()}`
              : metricKey === "successRate"
                ? `${numericValue.toFixed(1)}%`
                : numericValue;

          return (
            <MetricCard
              key={metricKey}
              label={metric.label}
              value={value}
              onClick={
                metricKey === "totalRevenue" || metricKey === "successRate"
                  ? () => navigate("/transactions?status=COMPLETED")
                  : () => navigate("/transactions")
              }
            />
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white border mt-6 border-gray-200 rounded-md h-64 p-4">
        <ChartComponent data={chartData} />
      </div>
    </div>
  );
};

export default Overview;
