import { useNavigate } from "react-router-dom";
import MetricCard from "./MetricCard";
import { type DashboardConfig } from "../config/app.config";
import { metricRegistry, type Metrics } from "../registry/metricRegistry";
import { chartRegistry } from "../registry/chartRegistry";
import { transactions } from "../mocks/transactions.mock";

const Overview = ({
  metrics,
  config,
}: {
  metrics: Metrics;
  config: DashboardConfig;
}) => {
  const navigate = useNavigate();

  const chartConfig = chartRegistry[config.overview.chart];
  const ChartComponent = chartConfig.component;
  const chartData = chartConfig.deriveData(transactions);

  return (
    <div className="mt-6">
      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-4">
        {config.overview.kpis.map(({ key: metricKey }) => {
          const metric = metricRegistry[metricKey];
          const key = metricKey as keyof Metrics;
          const metricVal = metrics[key];

          const value =
            metricKey === "totalRevenue"
              ? `₹${metricVal.toLocaleString()}`
              : metricKey === "successRate"
                ? `${metricVal.toFixed(1)}%`
                : metricVal;

          return (
            <MetricCard
              key={metricKey}
              label={metric.label}
              value={value}
              onClick={
                metricKey === "totalRevenue" || metricKey === "successRate"
                  ? () => navigate("/transactions?status=completed")
                  : () => navigate("/transactions")
              }
            />
          );
        })}
      </div>

      <div className="bg-white border mt-6 border-gray-200 rounded-md h-64 p-4">
        <ChartComponent statusBreakdown={chartData} />
      </div>
    </div>
  );
};

export default Overview;
