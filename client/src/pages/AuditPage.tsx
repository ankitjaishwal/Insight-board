import { useMemo, useState } from "react";
import { Navigate, useOutletContext, useSearchParams } from "react-router-dom";
import DataTable from "../components/DataTable";
import AuditFilters from "../components/AuditFilters";
import { useAuditQuery } from "../hooks/useAuditQuery";
import { usePermission } from "../hooks/usePermission";
import type { Column } from "../types/table";
import type { AuditLog } from "../types/audit";
import type { RouteConfig } from "../config/app.config";
import { formatDateTime } from "../utils";

const columns: Column<AuditLog>[] = [
  {
    key: "createdAt",
    header: "Timestamp",
    sortable: true,
    render: (value) => formatDateTime(String(value)),
  },
  { key: "userEmail", header: "User" },
  {
    key: "action",
    header: "Action",
    render: (value) => {
      const action = String(value);
      const labelMap: Record<string, string> = {
        CREATE_TRANSACTION: "CREATE",
        UPDATE_TRANSACTION: "UPDATE",
        DELETE_TRANSACTION: "DELETE",
        DEMO_RESET_SEEDED: "RESET",
        VIEW_TRANSACTION: "VIEW",
      };
      const label = labelMap[action] ?? action.replaceAll("_", " ");
      const isCreate = action.includes("CREATE");
      const isUpdate = action.includes("UPDATE");
      const isDelete = action.includes("DELETE");
      const colorClass = isCreate
        ? "bg-green-100 text-green-700"
        : isUpdate
          ? "bg-blue-100 text-blue-700"
          : isDelete
            ? "bg-red-100 text-red-700"
            : "bg-gray-100 text-gray-700";

      return (
        <span
          title={action}
          className={`inline-flex min-w-20 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
        >
          {label}
        </span>
      );
    },
  },
  { key: "entity", header: "Entity" },
  { key: "entityId", header: "Entity ID" },
];

function prettyJson(value: unknown | null): string {
  if (value === null || value === undefined) {
    return "No data";
  }

  const rendered = JSON.stringify(value, null, 2);
  return rendered ?? "No data";
}

export default function AuditPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, meta, page, limit, isLoading, isFetching, isError } =
    useAuditQuery(searchParams);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const canViewAudit = usePermission("audit");
  const outletContext = useOutletContext<
    { activeRoute?: RouteConfig } | undefined
  >();
  const pageTitle = outletContext?.activeRoute?.label ?? "Audit Logs";

  const sorting = useMemo(() => {
    const dir: "asc" | "desc" =
      searchParams.get("dir") === "asc" ? "asc" : "desc";
    return {
      key: "createdAt" as keyof AuditLog,
      direction: dir,
    };
  }, [searchParams]);

  if (!canViewAudit) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">{pageTitle}</h1>

      <AuditFilters />

      <div className="flex-1 min-h-0">
        <DataTable<AuditLog>
          columns={columns}
          data={data}
          sorting={sorting}
          onSort={(key) => {
            if (key !== "createdAt") return;

            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              const dir = prev.get("dir") === "asc" ? "desc" : "asc";
              next.set("dir", dir);
              next.set("page", "1");
              return next;
            });
          }}
          getRowId={(row) => row.id}
          expandedRowIds={expandedIds}
          onRowClick={(row) => {
            setExpandedIds((prev) => {
              const next = new Set(prev);
              if (next.has(row.id)) next.delete(row.id);
              else next.add(row.id);
              return next;
            });
          }}
          getRowClassName={(row) =>
            expandedIds.has(row.id) ? "bg-gray-50" : ""
          }
          renderExpandedRow={(row) => (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Before
                </h3>
                <pre className="overflow-auto rounded bg-gray-100 p-3 text-xs">
                  {prettyJson(row.before)}
                </pre>
              </div>
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  After
                </h3>
                <pre className="overflow-auto rounded bg-gray-100 p-3 text-xs">
                  {prettyJson(row.after)}
                </pre>
              </div>
            </div>
          )}
          maxHeightClassName="max-h-[calc(100vh-380px)]"
        />
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-700">Total: {meta?.total ?? 0}</div>
        <div className="flex items-center gap-2">
          <label htmlFor="audit-page-size" className="text-sm text-gray-600">
            Rows per page
          </label>
          <select
            id="audit-page-size"
            value={limit}
            onChange={(e) => {
              const nextLimit = Number(e.target.value);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("limit", String(nextLimit));
                next.set("page", "1");
                return next;
              });
            }}
            className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", String(Math.max(page - 1, 1)));
                return next;
              });
            }}
            disabled={page <= 1}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {meta?.page ?? page} of {meta?.pages ?? 1}
          </span>
          <button
            type="button"
            onClick={() => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("page", String(page + 1));
                return next;
              });
            }}
            disabled={page >= (meta?.pages ?? 1)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="mt-3 text-sm text-gray-500">Loading audit logs...</p>
      )}
      {isFetching && !isLoading && (
        <p className="mt-3 text-sm text-gray-500">Refreshing audit logs...</p>
      )}
      {isError && (
        <p className="mt-3 text-sm text-red-600">Failed to load audit logs</p>
      )}
    </div>
  );
}
