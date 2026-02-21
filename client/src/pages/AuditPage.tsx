import DataTable from "../components/DataTable";
import { auditLogs } from "../mocks/audit.mock";
import type { AuditLog } from "../types/audit";
import type { Column } from "../types/table";
import { applySorting, formatDateTime } from "../utils";
import type { AuditAction } from "../types/audit";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { RouteConfig } from "../config/app.config";

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
  const [sorting, setSorting] = useState<{
    key: keyof AuditLog;
    direction: "asc" | "desc";
  } | null>(null);

  const { activeRoute } = useOutletContext<{ activeRoute: RouteConfig }>();

  const sortedAuditLogs = applySorting(auditLogs, sorting);

  const handleSort = (key: keyof AuditLog) => {
    setSorting((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }

      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }

      return null;
    });
  };

  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">
        {activeRoute.label}
      </h1>

      <DataTable<AuditLog>
        columns={columns}
        data={sortedAuditLogs}
        sorting={sorting}
        onSort={handleSort}
        getRowId={(row) => row.id}
      />
    </>
  );
};

export default AuditPage;
