import { useNavigate } from "react-router-dom";
import MetricCard from "./MetricCard";
import { type Metrics } from "../types";
import Chart from "./Chart";

const Overview = ({ metrics, statusBreakdown }: { metrics: Metrics, statusBreakdown: Record<string, number> }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6">
      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total Users"
          value={metrics.totalUsers}
          onClick={() => navigate("/transactions")}
        />

        <MetricCard
          label="Total Revenue"
          value={`₹${metrics.totalAmount.toLocaleString()}`}
          onClick={() => navigate("/transactions?status=completed")}
        />

        <MetricCard
          label="Total Transactions"
          value={metrics.totalTransactions}
          onClick={() => navigate("/transactions")}
        />

        <MetricCard
          label="Success Rate"
          value={`${metrics.successRate.toFixed(1)}%`}
          onClick={() => navigate("/transactions?status=completed")}
        />
      </div>

      <div className="bg-white border mt-6 border-gray-200 rounded-md h-64 p-4">
        <Chart statusBreakdown={statusBreakdown} />
      </div>
    </div>
  );
};

export default Overview;
