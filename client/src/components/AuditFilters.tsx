import { useSearchParams } from "react-router-dom";

const actionOptions = [
  "CREATE_TRANSACTION",
  "UPDATE_TRANSACTION",
  "DELETE_TRANSACTION",
  "DEMO_RESET_SEEDED",
];

const entityOptions = ["TRANSACTION"];

function updateParam(
  setSearchParams: (
    nextInit: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  ) => void,
  key: string,
  value: string,
) {
  setSearchParams((prev) => {
    const next = new URLSearchParams(prev);

    if (value.trim()) {
      next.set(key, value.trim());
    } else {
      next.delete(key);
    }

    next.set("page", "1");
    return next;
  });
}

export default function AuditFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const userId = searchParams.get("userId") ?? "";
  const action = searchParams.get("action") ?? "";
  const entity = searchParams.get("entity") ?? "";
  const search = searchParams.get("search") ?? "";

  return (
    <div className="surface-panel mb-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
        <input
          type="date"
          aria-label="From date"
          value={from}
          onChange={(e) => updateParam(setSearchParams, "from", e.target.value)}
          className="ui-input w-full"
        />

        <input
          type="date"
          aria-label="To date"
          value={to}
          onChange={(e) => updateParam(setSearchParams, "to", e.target.value)}
          className="ui-input w-full"
        />

        <input
          type="text"
          aria-label="User ID or email"
          placeholder="User ID / email"
          value={userId}
          onChange={(e) => updateParam(setSearchParams, "userId", e.target.value)}
          className="ui-input w-full"
        />

        <select
          aria-label="Action"
          value={action}
          onChange={(e) => updateParam(setSearchParams, "action", e.target.value)}
          className="ui-select w-full"
        >
          <option value="">All actions</option>
          {actionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          aria-label="Entity"
          value={entity}
          onChange={(e) => updateParam(setSearchParams, "entity", e.target.value)}
          className="ui-select w-full"
        >
          <option value="">All entities</option>
          {entityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          type="text"
          aria-label="Entity ID search"
          placeholder="Search Entity ID"
          value={search}
          onChange={(e) => updateParam(setSearchParams, "search", e.target.value)}
          className="ui-input w-full"
        />
      </div>
    </div>
  );
}
