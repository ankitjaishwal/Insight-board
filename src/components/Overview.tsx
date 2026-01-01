import MetricCard from "./MetricC/MetricCard";

const Overview = () => {
  return (
    <div className="p-6">
      <h1 className="text-xl text-gray-900 font-semibold">Overview</h1>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <MetricCard label="Total Users" value="12,450" />
        <MetricCard label="Total Revenue" value="₹4,20,000" />
        <MetricCard label="Total Transactions" value="38,912" />
        <MetricCard label="Success Rate" value="98.4%" />
      </div>

      {/* TODO - Add chart */}
      <div className="bg-white border mt-6 border-gray-200 rounded-md p-4 h-64 flex items-center justify-center text-sm text-gray-400">
        Chart will be rendered here.
      </div>
    </div>
  );
};

export default Overview;
