import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const Chart = ({
  statusBreakdown,
}: {
  statusBreakdown: Record<string, number>;
}) => {
  const data = Object.entries(statusBreakdown).map(
    ([status, count]) => ({
      status,
      count,
    })
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
				barSize={40}
				barCategoryGap="30%"
        data={data}
        margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
      >
        <XAxis dataKey="status" />
        <YAxis allowDecimals={false} />
        <Bar dataKey="count" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Chart;
