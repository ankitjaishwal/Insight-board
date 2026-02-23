import { fetchWithAuth } from "./fetchWithAuth";
import type { Transaction } from "../types/transaction";

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

export type TransactionListResponse = {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type CreateTransactionPayload = {
  userName: string;
  amount: number;
  date: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
};

export type UpdateTransactionPayload = Partial<CreateTransactionPayload>;

export class TransactionApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "TransactionApiError";
    this.status = status;
    this.details = details;
  }
}

async function throwApiError(
  res: Response,
  fallbackMessage: string,
): Promise<never> {
  let payload: unknown;

  try {
    payload = await res.json();
  } catch {
    payload = undefined;
  }

  const parsed = payload as { error?: unknown; details?: unknown } | undefined;
  const message =
    typeof parsed?.error === "string" ? parsed.error : fallbackMessage;

  throw new TransactionApiError(message, res.status, parsed?.details);
}

export async function fetchTransactions(
  params: FetchTransactionsParams,
): Promise<TransactionListResponse> {
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
    return throwApiError(res, "Failed to fetch transactions");
  }

  return res.json();
}

export async function createTransaction(
  payload: CreateTransactionPayload,
): Promise<Transaction> {
  const res = await fetchWithAuth("http://localhost:4000/api/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return throwApiError(res, "Failed to create transaction");
  }

  return res.json();
}

export async function updateTransaction(
  id: string,
  payload: UpdateTransactionPayload,
): Promise<Transaction> {
  const res = await fetchWithAuth(
    `http://localhost:4000/api/transactions/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    return throwApiError(res, "Failed to update transaction");
  }

  return res.json();
}

export async function deleteTransaction(
  id: string,
): Promise<{ message: string }> {
  const res = await fetchWithAuth(
    `http://localhost:4000/api/transactions/${id}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    return throwApiError(res, "Failed to delete transaction");
  }

  return res.json();
}
