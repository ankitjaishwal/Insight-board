import { fetchWithAuth } from "./fetchWithAuth";
import type { AuditLog } from "../types/audit";

export type FetchAuditLogsParams = {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  userId?: string;
  action?: string;
  entity?: string;
  search?: string;
  sort?: "createdAt";
  dir?: "asc" | "desc";
};

export type FetchAuditLogsResponse = {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export async function fetchAuditLogs(
  params: FetchAuditLogsParams,
): Promise<FetchAuditLogsResponse> {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, String(v));
    }
  });

  const res = await fetchWithAuth(`http://localhost:4000/api/audit-logs?${qs}`);

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Fetch failed");
  }

  return res.json();
}
