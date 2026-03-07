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
        className="mb-0.5 block text-xs font-medium text-slate-600 dark:text-slate-300"
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
        className={`w-full rounded-lg border px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-500/40"
            : "border-slate-200 focus:ring-blue-500 dark:border-slate-700"
        }`}
      />
      <div className="h-4 mt-0.5">
        {error && (
          <p className="flex items-center gap-0.5 text-xs text-red-600">
            <span>⚠</span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
