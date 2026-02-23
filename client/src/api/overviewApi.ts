import { fetchWithAuth } from "./fetchWithAuth";

export type OverviewResponse = {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  successRate: number;
  statusBreakdown: Record<string, number>;
};

export async function fetchOverview(): Promise<OverviewResponse> {
  const res = await fetchWithAuth("http://localhost:4000/api/overview");

  if (!res.ok) {
    throw new Error("Failed to fetch overview");
  }

  return res.json();
}
