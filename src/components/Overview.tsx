import MetricCard from "./MetricCard";
import { type Metrics } from "../types";

const Overview = ({ metrics }: { metrics: Metrics }) => {
  return (
    <div className="mt-6">
      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Users" value={metrics.totalUsers} />
        <MetricCard
          label="Total Revenue"
          value={`₹${metrics.totalAmount.toLocaleString()}`}
        />
        <MetricCard
          label="Total Transactions"
          value={metrics.totalTransactions}
        />
        <MetricCard
          label="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
        />
      </div>

      {/* TODO - Add chart */}
      <div className="bg-white border mt-6 border-gray-200 rounded-md p-4 h-64 flex items-center justify-center text-sm text-gray-400">
        Chart will be rendered here.
      </div>
    </div>
  );
};

export default Overview;
