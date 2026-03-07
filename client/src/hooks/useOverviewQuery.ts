import { useQuery } from "@tanstack/react-query";
import { fetchOverview, type OverviewResponse } from "../api/overviewApi";

export const overviewQueryKey = ["overview"] as const;

export function useOverviewQuery() {
  const query = useQuery<OverviewResponse, Error>({
    queryKey: overviewQueryKey,
    queryFn: fetchOverview,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.isError ? query.error.message : null,
  };
}
