import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { routes } from "../routes";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import * as authApi from "../api/authApi";
import * as transactionApi from "../api/transactionApi";
import * as overviewApi from "../api/overviewApi";
import * as auditApi from "../api/auditApi";
import * as presetsApi from "../api/presetsApi";
import type { FilterPreset } from "../types/preset";
import { Status } from "../types/transaction";
import type {
  CreateTransactionPayload,
  FetchTransactionsParams,
  TransactionListResponse,
  UpdateTransactionPayload,
} from "../api/transactionApi";
import type { Transaction } from "../types/transaction";

function encodeBase64Url(value: string): string {
  return btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function makeToken(expOffsetSeconds = 300): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({ iat: nowSec, exp: nowSec + expOffsetSeconds }),
  );
  return `${header}.${payload}.signature`;
}

const defaultUser = {
  id: "test-user",
  name: "Test User",
  email: "test@example.com",
  role: "ADMIN",
};

type RenderAppOptions = {
  user?: typeof defaultUser;
  fetchTransactionsMock?: (
    params: FetchTransactionsParams,
  ) => Promise<TransactionListResponse> | TransactionListResponse;
};

type StoredTransaction = Transaction & { id: string };

const transactionResponse = {
  data: [
    {
      transactionId: "txn-1",
      userName: "Alice",
      status: Status.Completed,
      amount: 120,
      date: "2026-01-15T00:00:00.000Z",
    },
  ],
  meta: {
    total: 1,
    page: 1,
    limit: 20,
    pages: 1,
  },
};

const overviewResponse = {
  totalUsers: 42,
  totalTransactions: 128,
  totalRevenue: 99999,
  successRate: 94,
  statusBreakdown: {
    Completed: 100,
    Pending: 20,
    Failed: 8,
  },
};

const auditResponse = {
  data: [
    {
      id: "audit-1",
      action: "VIEW_TRANSACTIONS",
      entityId: "txn-1",
      meta: null,
      createdAt: "2026-01-15T10:00:00.000Z",
      user: {
        email: "admin@example.com",
        role: "ADMIN",
      },
    },
  ],
  meta: {
    total: 1,
    page: 1,
    limit: 20,
    pages: 1,
  },
};

export async function renderApp(route = "/", options: RenderAppOptions = {}) {
  const presetsStore: FilterPreset[] = [];
  const activeUser = options.user ?? defaultUser;
  const transactionsStore: StoredTransaction[] = [...transactionResponse.data].map((tx) => ({
    ...tx,
    id: tx.transactionId ?? crypto.randomUUID(),
  }));

  if (!localStorage.getItem("token")) {
    localStorage.setItem("token", makeToken());
  }

  vi.spyOn(authApi, "getMe").mockResolvedValue(activeUser);
  vi.spyOn(transactionApi, "fetchTransactions").mockImplementation(
    async (params: FetchTransactionsParams) => {
      if (options.fetchTransactionsMock) {
        return options.fetchTransactionsMock(params);
      }

      return {
        data: [...transactionsStore],
        meta: {
          total: transactionsStore.length,
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          pages: 1,
        },
      };
    },
  );
  vi.spyOn(transactionApi, "createTransaction").mockImplementation(
    async (payload: CreateTransactionPayload) => {
      const created: StoredTransaction = {
        id: crypto.randomUUID(),
        transactionId: `txn-${transactionsStore.length + 1}`,
        userName: payload.userName,
        amount: payload.amount,
        date: payload.date,
        status: payload.status,
      };
      transactionsStore.unshift(created);
      return created;
    },
  );
  vi.spyOn(transactionApi, "updateTransaction").mockImplementation(
    async (id: string, payload: UpdateTransactionPayload) => {
      const index = transactionsStore.findIndex((tx) => tx.id === id);
      if (index === -1) throw new Error("Transaction not found");

      transactionsStore[index] = {
        ...transactionsStore[index],
        ...payload,
      };

      return transactionsStore[index];
    },
  );
  vi.spyOn(transactionApi, "deleteTransaction").mockImplementation(
    async (id: string) => {
      const index = transactionsStore.findIndex((tx) => tx.id === id);
      if (index >= 0) {
        transactionsStore.splice(index, 1);
      }

      return { message: "Transaction deleted successfully" };
    },
  );
  vi.spyOn(overviewApi, "fetchOverview").mockResolvedValue(overviewResponse);
  vi.spyOn(auditApi, "fetchAuditLogs").mockResolvedValue(auditResponse);
  vi.spyOn(presetsApi, "fetchPresets").mockImplementation(async () => [
    ...presetsStore,
  ]);
  vi.spyOn(presetsApi, "createPreset").mockImplementation(async (newPreset) => {
    presetsStore.push(newPreset);
    return newPreset;
  });
  vi.spyOn(presetsApi, "updatePreset").mockImplementation(
    async (nextPreset) => {
      const index = presetsStore.findIndex(
        (preset) => preset.id === nextPreset.id,
      );
      if (index === -1) {
        throw new Error("Preset not found");
      }

      presetsStore[index] = nextPreset;
      return nextPreset;
    },
  );
  vi.spyOn(presetsApi, "deletePreset").mockImplementation(async (presetId) => {
    const index = presetsStore.findIndex((preset) => preset.id === presetId);
    if (index >= 0) {
      presetsStore.splice(index, 1);
    }

    return presetId;
  });

  const router = createMemoryRouter(routes, {
    initialEntries: [route],
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>,
  );

  await waitFor(() => {
    if (utils.queryByText("Loading...")) {
      throw new Error("Auth is still loading");
    }
  });

  return {
    ...utils,
    router,
  };
}
