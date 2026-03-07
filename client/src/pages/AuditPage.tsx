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
import { TableSkeleton } from "../components/LoadingSkeletons";

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
        ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
        : isUpdate
          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
          : isDelete
            ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
            : "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200";

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
  {
    key: "entity",
    header: "Entity",
    render: (value) => (
      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tracking-wide text-slate-700 dark:bg-slate-700/40 dark:text-slate-200">
        {String(value)}
      </span>
    ),
  },
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
      <h1 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {pageTitle}
      </h1>

      <AuditFilters />

      <div className="flex-1 min-h-0">
        {isLoading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : data.length === 0 ? (
          <div className="ui-empty-state">
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              No audit logs yet
            </p>
          </div>
        ) : (
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
              expandedIds.has(row.id) ? "bg-slate-50 dark:bg-slate-800/80" : ""
            }
            renderExpandedRow={(row) => (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Before
                  </h3>
                  <pre className="overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    {prettyJson(row.before)}
                  </pre>
                </div>
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    After
                  </h3>
                  <pre className="overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    {prettyJson(row.after)}
                  </pre>
                </div>
              </div>
            )}
            maxHeightClassName="max-h-[calc(100vh-380px)]"
          />
        )}
      </div>

      <div className="surface-card mt-3 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-700 dark:text-slate-200">
          Total: {meta?.total ?? 0}
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="audit-page-size"
            className="text-sm text-slate-600 dark:text-slate-300"
          >
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
            className="ui-select"
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
            className="ui-button-secondary px-3 py-1.5"
          >
            Prev
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
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
            className="ui-button-secondary px-3 py-1.5"
          >
            Next
          </button>
        </div>
      </div>

      {isFetching && !isLoading && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Refreshing audit logs...
        </p>
      )}
      {isError && (
        <p className="mt-3 text-sm text-red-600">Failed to load audit logs</p>
      )}
    </div>
  );
}
