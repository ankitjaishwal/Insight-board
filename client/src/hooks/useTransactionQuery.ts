import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchTransactions,
  type TransactionListResponse,
} from "../api/transactionApi";
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
  const queryParams = useMemo(() => {
    const next = new URLSearchParams(searchParams);
    next.delete("page");
    return next;
  }, [searchParams]);

  const limit = useMemo(() => {
    const rawLimit = Number(queryParams.get("limit"));

    if (
      Number.isInteger(rawLimit) &&
      ALLOWED_PAGE_LIMITS.includes(
        rawLimit as (typeof ALLOWED_PAGE_LIMITS)[number],
      )
    ) {
      return rawLimit;
    }

    return 20;
  }, [queryParams]);

  const filters = useMemo(() => parseFilters(queryParams), [queryParams]);

  const validation = useMemo(() => validateFilters(filters), [filters]);

  const hasActiveFilters = useMemo(
    () => hasActiveFiltersUtil(filters),
    [filters],
  );

  const sortKey = mapSortParam(queryParams.get("sort")) as
    | keyof Transaction
    | undefined;

  const direction = queryParams.get("dir") as SortDirection | null;

  const sorting = sortKey && direction ? { key: sortKey, direction } : null;

  const query = useInfiniteQuery<TransactionListResponse, Error>({
    queryKey: [...transactionsQueryKey, queryParams.toString()],
    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      fetchTransactions({
        search: filters.search,
        status: normalizeStatusParam(queryParams.get("status")),
        from: filters.from,
        to: filters.to,
        min: filters.minAmount,
        max: filters.maxAmount,
        page: Number(pageParam),
        limit,
        sort: sortKey,
        dir: direction || undefined,
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.meta.page < lastPage.meta.pages
        ? lastPage.meta.page + 1
        : undefined;
    },

    placeholderData: (prev) => prev,

    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const data = useMemo(() => {
    const seen = new Set<string>();
    const flat = query.data?.pages.flatMap((page) => page.data) ?? [];

    return flat.filter((tx) => {
      const key = tx.id ?? tx.transactionId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [query.data]);

  const meta = query.data?.pages[query.data.pages.length - 1]?.meta;

  return {
    data,
    meta,
    limit,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    filters,
    validation,
    hasActiveFilters,
    sorting,
  };
}
