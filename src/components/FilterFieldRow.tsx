interface FilterFieldRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  type?: "date" | "number";
  id?: string;
}

export const FilterFieldRow: React.FC<FilterFieldRowProps> = ({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  placeholder,
  type = "text",
  id,
}) => {
  return (
    <div className="flex-1">
      <label
        htmlFor={id}
        className="block text-xs text-gray-600 mb-0.5 font-medium"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 ${
          error
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      <div className="h-4 mt-0.5">
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-0.5">
            <span>⚠</span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
