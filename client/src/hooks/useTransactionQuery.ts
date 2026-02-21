import { useEffect, useMemo, useState } from "react";
import { fetchTransactions } from "../api/transactionApi";
import { parseFilters } from "../filters/filters.parser";
import type { Transaction } from "../types/transaction";
import { hasActiveFilters as hasActiveFiltersUtil } from "../utils/presetUtils";
import { validateFilters } from "../utils/validation";

type SortDirection = "asc" | "desc";

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
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchTransactions({
          search: filters.search,
          status: normalizeStatusParam(searchParams.get("status")),
          from: filters.from,
          to: filters.to,
          min: filters.minAmount,
          max: filters.maxAmount,
          page: Number(searchParams.get("page") || 1),
          limit: 20,
          sort: sortKey,
          dir: direction || undefined,
        });

        setData(result.data);
      } catch (e) {
        console.error(e);
        setData([]);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters, searchParams]);

  return {
    data,
    loading,
    error,
    filters,
    validation,
    hasActiveFilters,
    sorting,
  };
}
