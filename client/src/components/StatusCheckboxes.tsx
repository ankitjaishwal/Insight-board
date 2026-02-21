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
    <div className="flex gap-3 items-center">
      <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
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
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <span className="text-sm text-gray-700">{status}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
