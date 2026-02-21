export type FetchAuditLogsParams = {
  search?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: "createdAt" | "action";
  dir?: "asc" | "desc";
};

type AuditApiRow = {
  id: string;
  action: string;
  entityId?: string | null;
  meta?: string | null;
  createdAt: string;
  user?: {
    email?: string | null;
    role?: string | null;
  } | null;
};

export type FetchAuditLogsResponse = {
  data: AuditApiRow[];
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

  const res = await fetch(`http://localhost:4000/api/audit-logs?${qs}`);

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Fetch failed");
  }

  return res.json();
}
