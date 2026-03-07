import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "../api/auditApi";

const ALLOWED_PAGE_LIMITS = [20, 50, 100] as const;
export const auditLogsQueryKey = ["auditLogs"] as const;

export function useAuditQuery(searchParams: URLSearchParams) {
  const page = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isInteger(raw) && raw > 0 ? raw : 1;
  }, [searchParams]);

  const limit = useMemo(() => {
    const raw = Number(searchParams.get("limit") ?? "20");
    return ALLOWED_PAGE_LIMITS.includes(raw as (typeof ALLOWED_PAGE_LIMITS)[number])
      ? raw
      : 20;
  }, [searchParams]);

  const query = useQuery({
    queryKey: [...auditLogsQueryKey, searchParams.toString()],
    queryFn: () =>
      fetchAuditLogs({
        page,
        limit,
        from: searchParams.get("from") || undefined,
        to: searchParams.get("to") || undefined,
        userId: searchParams.get("userId") || undefined,
        action: searchParams.get("action") || undefined,
        entity: searchParams.get("entity") || undefined,
        search: searchParams.get("search") || undefined,
        sort: "createdAt",
        dir: (searchParams.get("dir") as "asc" | "desc" | null) || "desc",
      }),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta,
    page,
    limit,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
  };
}
