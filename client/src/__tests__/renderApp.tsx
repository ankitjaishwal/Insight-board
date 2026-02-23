import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { routes } from "../routes";
import { AuthProvider } from "../context/AuthContext";
import * as authApi from "../api/authApi";
import * as transactionApi from "../api/transactionApi";
import * as overviewApi from "../api/overviewApi";
import * as auditApi from "../api/auditApi";

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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

const transactionResponse = {
  data: [
    {
      transactionId: "txn-1",
      userName: "Alice",
      status: "Completed",
      amount: 120,
      date: "2026-01-15T00:00:00.000Z",
    },
  ],
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

export async function renderApp(route = "/") {
  if (!localStorage.getItem("token")) {
    localStorage.setItem("token", makeToken());
  }

  vi.spyOn(authApi, "getMe").mockResolvedValue(defaultUser);
  vi.spyOn(transactionApi, "fetchTransactions").mockResolvedValue(
    transactionResponse,
  );
  vi.spyOn(overviewApi, "fetchOverview").mockResolvedValue(overviewResponse);
  vi.spyOn(auditApi, "fetchAuditLogs").mockResolvedValue(auditResponse);

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
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
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
