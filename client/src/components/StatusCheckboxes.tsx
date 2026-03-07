import { Status } from "../types/transaction";

interface StatusCheckboxesProps {
  selectedStatuses: string[];
  onChange: (status: string, checked: boolean) => void;
}

export const StatusCheckboxes: React.FC<StatusCheckboxesProps> = ({
  selectedStatuses,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="whitespace-nowrap text-xs font-medium text-slate-600 dark:text-slate-300">
        Status:
      </span>
      <div className="flex gap-3">
        {[Status.Completed, Status.Pending, Status.Failed].map((status) => (
          <label
            key={status}
            className="flex items-center gap-1 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedStatuses.includes(status)}
              onChange={(e) => onChange(status, e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-300 dark:border-slate-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              {status}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
