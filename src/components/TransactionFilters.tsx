import { Status } from "../types/transaction";
import { statusToParam, paramToStatus } from "../utils";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: (
    nextInit: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  ) => void;
};

const TransactionFilters: React.FC<Props> = ({
  searchParams,
  setSearchParams,
}) => {
  const search = searchParams.get("search") || "";

  const statusParam = searchParams.get("status") || "";
  const status =
    statusParam && paramToStatus[statusParam]
      ? paramToStatus[statusParam]
      : ("All" as "All");

  const updateSearch = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value.trim()) next.set("search", value);
      else next.delete("search");
      return next;
    });
  };

  const updateStatus = (value: Status | "All") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value && value !== "All") next.set("status", statusToParam[value]);
      else next.delete("status");
      return next;
    });
  };

  return (
    <div className="flex items-center gap-4 mb-4 h-10">
      <input
        name="search"
        type="search"
        aria-label="Search transactions"
        value={search}
        onChange={(e) => updateSearch(e.target.value)}
        placeholder="Search by ID or user"
        className="border border-gray-300 focus:ring-blue-500 rounded px-3 py-1 h-10 text-sm"
      />

      <select
        aria-label="Filter by status"
        value={status}
        onChange={(e) => updateStatus(e.target.value as Status | "All")}
        className="border border-gray-300 rounded px-2 py-1 h-10 text-sm"
      >
        <option value="All">All</option>
        <option value={Status.Completed}>Completed</option>
        <option value={Status.Pending}>Pending</option>
        <option value={Status.Failed}>Failed</option>
      </select>
    </div>
  );
};

export default TransactionFilters;
