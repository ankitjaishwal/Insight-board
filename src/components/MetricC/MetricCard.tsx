type MetricCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
};

const MetricCard = ({ label, value, helperText }: MetricCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

export default MetricCard;
