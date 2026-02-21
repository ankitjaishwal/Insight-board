type MetricCardProps = {
  label: string;
  value: string | number;
  onClick?: () => void;
};

const MetricCard = ({ label, value, onClick }: MetricCardProps) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-md p-4 ${
        onClick ? "cursor-pointer hover:bg-gray-50" : ""
      }`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-blue-600">{value}</p>
    </div>
  );
};

export default MetricCard;
