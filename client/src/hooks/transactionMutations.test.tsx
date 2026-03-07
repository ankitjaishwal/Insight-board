import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { act, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateTransaction } from "./useCreateTransaction";
import { useUpdateTransaction } from "./useUpdateTransaction";
import { useDeleteTransaction } from "./useDeleteTransaction";
import { transactionsQueryKey } from "./useTransactionQuery";
import { overviewQueryKey } from "./useOverviewQuery";
import { auditLogsQueryKey } from "./useAuditQuery";

const createTransactionMock = vi.fn();
const updateTransactionMock = vi.fn();
const deleteTransactionMock = vi.fn();

vi.mock("../api/transactionApi", async () => {
  const actual = await vi.importActual("../api/transactionApi");

  return {
    ...actual,
    createTransaction: (...args: unknown[]) => createTransactionMock(...args),
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

  it("invalidates transactions, overview, and audit queries after create", async () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    createTransactionMock.mockResolvedValueOnce({
      id: "tx-2",
      transactionId: "txn-2",
      userName: "Bob",
      status: "COMPLETED",
      amount: 200,
      date: "2026-01-16T00:00:00.000Z",
    });

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        userName: "Bob",
        amount: 200,
        date: "2026-01-16T00:00:00.000Z",
        status: "COMPLETED" as never,
      });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: transactionsQueryKey,
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: overviewQueryKey,
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: auditLogsQueryKey,
      refetchType: "active",
    });
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

  it("invalidates overview and audit queries after update success", async () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    updateTransactionMock.mockResolvedValueOnce({
      id: "tx-1",
      transactionId: "txn-1",
      userName: "Alice Updated",
      status: "COMPLETED",
      amount: 120,
      date: "2026-01-15T00:00:00.000Z",
    });

    const { result } = renderHook(() => useUpdateTransaction(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "tx-1",
        payload: { userName: "Alice Updated" },
      });
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: overviewQueryKey,
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: auditLogsQueryKey,
      refetchType: "active",
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

  it("invalidates overview and audit queries after delete success", async () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    deleteTransactionMock.mockResolvedValueOnce({
      message: "Transaction deleted successfully",
    });

    const { result } = renderHook(() => useDeleteTransaction(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync("tx-1");
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: overviewQueryKey,
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: auditLogsQueryKey,
      refetchType: "active",
    });
  });
});
