import { useEffect, useState } from "react";
import { fetchAuditLogs } from "../api/auditApi";
import type { AuditAction, AuditLog } from "../types/audit";

type SortDirection = "asc" | "desc";

function toAuditAction(action: string): AuditAction {
  if (
    action === "LOGIN" ||
    action === "VIEW_TRANSACTIONS" ||
    action === "EXPORT_DATA" ||
    action === "CHANGE_CONFIG" ||
    action === "FILTER_APPLIED"
  ) {
    return action;
  }

  return "VIEW_TRANSACTIONS";
}

export function useAuditQuery(searchParams: URLSearchParams) {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortKey = searchParams.get("sort");
  const direction = searchParams.get("dir") as SortDirection | null;

  const sorting =
    sortKey && direction
      ? { key: (sortKey === "createdAt" ? "timestamp" : sortKey) as keyof AuditLog, direction }
      : null;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchAuditLogs({
          search: searchParams.get("search") || undefined,
          action: searchParams.get("action") || undefined,
          from: searchParams.get("from") || undefined,
          to: searchParams.get("to") || undefined,
          page: Number(searchParams.get("page") || 1),
          limit: 20,
          sort:
            searchParams.get("sort") === "action"
              ? "action"
              : "createdAt",
          dir: direction || "desc",
        });

        setData(
          result.data.map((row) => ({
            id: row.id,
            actor: row.user?.email ?? "System",
            role: row.user?.role ?? "System",
            action: toAuditAction(row.action),
            entity: row.entityId ?? undefined,
            timestamp: row.createdAt,
            metadata: row.meta ? { raw: row.meta } : undefined,
          })),
        );
      } catch (e) {
        console.error(e);
        setData([]);
        setError("Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [searchParams]);

  return {
    data,
    loading,
    error,
    sorting,
  };
}
