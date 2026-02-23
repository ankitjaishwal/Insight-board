import DataTable from "../components/DataTable";
import type { AuditLog } from "../types/audit";
import type { Column } from "../types/table";
import { formatDateTime } from "../utils";
import type { AuditAction } from "../types/audit";
import { Navigate, useOutletContext, useSearchParams } from "react-router-dom";
import type { RouteConfig } from "../config/app.config";
import { useAuditQuery } from "../hooks/useAuditQuery";
import { usePermission } from "../hooks/usePermission";

export const auditActionLabels: Record<AuditAction, string> = {
  LOGIN: "Logged in",
  VIEW_TRANSACTIONS: "Viewed transactions",
  EXPORT_DATA: "Exported data",
  CHANGE_CONFIG: "Changed configuration",
  FILTER_APPLIED: "Applied filter",
};

const columns: Column<AuditLog>[] = [
  {
    key: "timestamp",
    header: "Time",
    sortable: true,
    render: (value) => formatDateTime(value as string),
  },
  {
    key: "actor",
    header: "User",
  },
  {
    key: "role",
    header: "Role",
  },
  {
    key: "action",
    header: "Action",
    render: (value) =>
      auditActionLabels[value as keyof typeof auditActionLabels],
  },
  {
    key: "entity",
    header: "Entity",
  },
];

const AuditPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, isError, sorting } = useAuditQuery(searchParams);
  const outletContext = useOutletContext<
    { activeRoute?: RouteConfig } | undefined
  >();
  const pageTitle = outletContext?.activeRoute?.label ?? "Audit Logs";

  const handleSort = (key: keyof AuditLog) => {
    if (key !== "timestamp" && key !== "action") return;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const mappedKey = key === "timestamp" ? "createdAt" : "action";
      const currentSort = prev.get("sort");
      const currentDir = prev.get("dir") as "asc" | "desc" | null;

      if (currentSort !== mappedKey) {
        next.set("sort", mappedKey);
        next.set("dir", "asc");
        return next;
      }

      if (currentDir === "asc") {
        next.set("dir", "desc");
        return next;
      }

      next.delete("sort");
      next.delete("dir");
      return next;
    });
  };

  const canViewAudit = usePermission("audit");

  if (!canViewAudit) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">{pageTitle}</h1>

      <DataTable<AuditLog>
        columns={columns}
        data={data}
        sorting={sorting}
        onSort={handleSort}
        getRowId={(row) => row.id}
      />
      {isLoading && (
        <p className="text-sm text-gray-500 mt-3">Loading audit logs...</p>
      )}
      {isError && (
        <p className="text-sm text-red-600 mt-3">Failed to load audit logs</p>
      )}
    </>
  );
};

export default AuditPage;
