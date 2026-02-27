import { fetchWithAuth } from "./fetchWithAuth";

export type OverviewResponse = {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  successRate: number;

  failedCount: number;
  pendingCount: number;
  averageTransactionValue: number;

  last7DaysTransactions: { date: string; count: number }[];
  recentTransactions: {
    id: string;
    userName: string;
    amount: number;
    status: string;
    date: string;
  }[];

  statusBreakdown: Record<string, number>;
};

export async function fetchOverview(): Promise<OverviewResponse> {
  const res = await fetchWithAuth("http://localhost:4000/api/overview");

  if (!res.ok) {
    throw new Error("Failed to fetch overview");
  }

  return res.json();
}
