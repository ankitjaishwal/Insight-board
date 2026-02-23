import { useQuery } from "@tanstack/react-query";
import { fetchOverview, type OverviewResponse } from "../api/overviewApi";

export function useOverviewQuery() {
  const query = useQuery<OverviewResponse, Error>({
    queryKey: ["overview"],
    queryFn: fetchOverview,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.isError ? query.error.message : null,
  };
}
