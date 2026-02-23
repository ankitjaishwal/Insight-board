import { fetchWithAuth } from "./fetchWithAuth";

export type FetchTransactionsParams = {
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  min?: number;
  max?: number;
  page?: number;
  limit?: number;
  sort?: string;
  dir?: "asc" | "desc";
};

export async function fetchTransactions(params: FetchTransactionsParams) {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      qs.set(k, String(v));
    }
  });

  const res = await fetchWithAuth(
    `http://localhost:4000/api/transactions?${qs}`,
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Fetch failed");
  }

  return res.json();
}
