import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";

type Props = {
  data: {
    status: string;
    count: number;
  }[];
};

const Chart = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        barSize={40}
        barCategoryGap="30%"
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
