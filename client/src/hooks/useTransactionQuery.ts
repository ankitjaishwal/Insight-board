import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTransactions } from "../api/transactionApi";
import { parseFilters } from "../filters/filters.parser";
import type { Transaction } from "../types/transaction";
import { hasActiveFilters as hasActiveFiltersUtil } from "../utils/presetUtils";
import { validateFilters } from "../utils/validation";

type SortDirection = "asc" | "desc";
export const transactionsQueryKey = ["transactions"] as const;
const ALLOWED_PAGE_LIMITS = [20, 50, 100] as const;

function mapSortParam(sortParam: string | null): string | undefined {
  if (sortParam === "user") return "userName";

  if (
    sortParam === "date" ||
    sortParam === "amount" ||
    sortParam === "transactionId"
  ) {
    return sortParam;
  }

  return undefined;
}

function normalizeStatusParam(statusParam: string | null): string | undefined {
  if (!statusParam) return undefined;

  const parts = statusParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!parts.length) return undefined;

  const normalized = parts.map((s) => s.toUpperCase());
  const allStatuses = ["COMPLETED", "PENDING", "FAILED"];
  const hasAllStatuses = allStatuses.every((status) =>
    normalized.includes(status),
  );

  if (hasAllStatuses) return "ALL";

  return normalized.join(",");
}

export function useTransactionQuery(searchParams: URLSearchParams) {
  const page = useMemo(() => {
    const rawPage = Number(searchParams.get("page"));
    return Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  }, [searchParams]);

  const limit = useMemo(() => {
    const rawLimit = Number(searchParams.get("limit"));

    if (
      Number.isInteger(rawLimit) &&
      ALLOWED_PAGE_LIMITS.includes(rawLimit as (typeof ALLOWED_PAGE_LIMITS)[number])
    ) {
      return rawLimit;
    }

    return 20;
  }, [searchParams]);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const validation = useMemo(() => validateFilters(filters), [filters]);

  const hasActiveFilters = useMemo(
    () => hasActiveFiltersUtil(filters),
    [filters],
  );

  const sortKey = mapSortParam(searchParams.get("sort")) as
    | keyof Transaction
    | undefined;

  const direction = searchParams.get("dir") as SortDirection | null;

  const sorting = sortKey && direction ? { key: sortKey, direction } : null;

  const query = useQuery({
    queryKey: [...transactionsQueryKey, searchParams.toString()],
    queryFn: () =>
      fetchTransactions({
        search: filters.search,
        status: normalizeStatusParam(searchParams.get("status")),
        from: filters.from,
        to: filters.to,
        min: filters.minAmount,
        max: filters.maxAmount,
        page,
        limit,
        sort: sortKey,
        dir: direction || undefined,
      }),
  });

  return {
    data: query.data?.data ?? [],
    meta: query.data?.meta,
    page,
    limit,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    filters,
    validation,
    hasActiveFilters,
    sorting,
  };
}
