import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  FetchTransactionsParams,
  TransactionListResponse,
} from "../api/transactionApi";
import { renderApp } from "./renderApp";

describe("Transactions infinite-scroll integration", () => {
  it("ignores page URL param and uses pageParam=1 with limit", async () => {
    const fetchTransactionsMock = vi.fn(
      async (params: FetchTransactionsParams): Promise<TransactionListResponse> => ({
        data: [
          {
            id: "tx-1",
            transactionId: "txn-1",
            userName: "Alice",
            status: "Completed",
            amount: 120,
            date: "2026-01-15T00:00:00.000Z",
          },
        ],
        meta: {
          total: 120,
          page: params.page ?? 1,
          limit: params.limit ?? 20,
          pages: 3,
        },
      }),
    );

    const { router } = await renderApp("/ops/transactions?page=2&limit=50", {
      fetchTransactionsMock,
    });

    await waitFor(() => {
      expect(fetchTransactionsMock).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 50 }),
      );
    });

    expect(screen.getByText("Total: 120")).toBeInTheDocument();
    expect(screen.getByLabelText(/rows per page/i)).toHaveValue("50");
    expect(router.state.location.search).not.toContain("page=");
  });

  it("updates limit in URL and preserves filters/sort without page param", async () => {
    const user = userEvent.setup();

    const { router } = await renderApp(
      "/ops/transactions?search=Alice&status=Completed&sort=amount&dir=asc&page=1&limit=20",
      {
        fetchTransactionsMock: async (
          params: FetchTransactionsParams,
        ): Promise<TransactionListResponse> => ({
          data: [
            {
              id: "tx-1",
              transactionId: "txn-1",
              userName: "Alice",
              status: "Completed",
              amount: 120,
              date: "2026-01-15T00:00:00.000Z",
            },
          ],
          meta: {
            total: 120,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
            pages: 6,
          },
        }),
      },
    );

    await user.selectOptions(screen.getByLabelText(/rows per page/i), "100");

    await waitFor(() => {
      const search = router.state.location.search;
      expect(search).toContain("search=Alice");
      expect(search).toContain("status=Completed");
      expect(search).toContain("sort=amount");
      expect(search).toContain("dir=asc");
      expect(search).toContain("limit=100");
      expect(search).not.toContain("page=");
    });
  });
});
