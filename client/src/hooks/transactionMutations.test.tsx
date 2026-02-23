import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { act, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpdateTransaction } from "./useUpdateTransaction";
import { useDeleteTransaction } from "./useDeleteTransaction";

const updateTransactionMock = vi.fn();
const deleteTransactionMock = vi.fn();

vi.mock("../api/transactionApi", async () => {
  const actual = await vi.importActual("../api/transactionApi");

  return {
    ...actual,
    updateTransaction: (...args: unknown[]) => updateTransactionMock(...args),
    deleteTransaction: (...args: unknown[]) => deleteTransactionMock(...args),
  };
});

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("transaction mutation hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("optimistically updates and rolls back on update error", async () => {
    const queryClient = new QueryClient();
    const key = ["transactions", "search=alice"];

    queryClient.setQueryData(key, {
      data: [
        {
          id: "tx-1",
          transactionId: "txn-1",
          userName: "Alice",
          status: "COMPLETED",
          amount: 120,
          date: "2026-01-15T00:00:00.000Z",
        },
      ],
      meta: { total: 1, page: 1, limit: 20, pages: 1 },
    });

    let rejectUpdate!: (error: Error) => void;
    updateTransactionMock.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectUpdate = reject;
      }),
    );

    const { result } = renderHook(() => useUpdateTransaction(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate({
        id: "tx-1",
        payload: { userName: "Alice Updated" },
      });
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<{ data: Array<{ userName: string }> }>(key)
          ?.data[0].userName,
      ).toBe("Alice Updated");
    });

    act(() => {
      rejectUpdate(new Error("Update failed"));
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<{ data: Array<{ userName: string }> }>(key)
          ?.data[0].userName,
      ).toBe("Alice");
    });
  });

  it("optimistically removes and rolls back on delete error", async () => {
    const queryClient = new QueryClient();
    const key = ["transactions", "search=alice"];

    queryClient.setQueryData(key, {
      data: [
        {
          id: "tx-1",
          transactionId: "txn-1",
          userName: "Alice",
          status: "COMPLETED",
          amount: 120,
          date: "2026-01-15T00:00:00.000Z",
        },
      ],
      meta: { total: 1, page: 1, limit: 20, pages: 1 },
    });

    let rejectDelete!: (error: Error) => void;
    deleteTransactionMock.mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectDelete = reject;
      }),
    );

    const { result } = renderHook(() => useDeleteTransaction(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      result.current.mutate("tx-1");
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<{ data: Array<{ id: string }> }>(key)?.data.length,
      ).toBe(0);
    });

    act(() => {
      rejectDelete(new Error("Delete failed"));
    });

    await waitFor(() => {
      expect(
        queryClient.getQueryData<{ data: Array<{ id: string }> }>(key)?.data,
      ).toHaveLength(1);
    });
  });
});
