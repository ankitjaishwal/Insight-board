import { describe, it, expect } from "vitest";
import { deriveStatusBreakdown, applyTransactionFilters } from "./transactions";
import { Status } from "../types/transaction";
import type { Transaction } from "../types/transaction";

describe("transactions - deriveStatusBreakdown", () => {
  const transactions: Transaction[] = [
    {
      transactionId: "tx1",
      user: "Alice",
      status: Status.Completed,
      amount: 100,
      date: "2026-02-21",
    },
    {
      transactionId: "tx2",
      user: "Bob",
      status: Status.Completed,
      amount: 50,
      date: "2026-02-21",
    },
    {
      transactionId: "tx3",
      user: "Charlie",
      status: Status.Pending,
      amount: 75,
      date: "2026-02-21",
    },
    {
      transactionId: "tx4",
      user: "Dave",
      status: Status.Failed,
      amount: 25,
      date: "2026-02-21",
    },
  ];

  // Happy Path
  describe("happy path", () => {
    it("should count all statuses correctly", () => {
      const breakdown = deriveStatusBreakdown(transactions);
      expect(breakdown[Status.Completed]).toBe(2);
      expect(breakdown[Status.Pending]).toBe(1);
      expect(breakdown[Status.Failed]).toBe(1);
    });

    it("should include all status types", () => {
      const breakdown = deriveStatusBreakdown(transactions);
      expect(Object.keys(breakdown)).toContain(Status.Completed);
      expect(Object.keys(breakdown)).toContain(Status.Pending);
      expect(Object.keys(breakdown)).toContain(Status.Failed);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should handle single transaction", () => {
      const breakdown = deriveStatusBreakdown([transactions[0]]);
      expect(breakdown[Status.Completed]).toBe(1);
      expect(breakdown[Status.Pending]).toBeUndefined();
    });

    it("should handle all same status", () => {
      const singleStatusTxs = transactions.filter(
        (t) => t.status === Status.Completed,
      );
      const breakdown = deriveStatusBreakdown(singleStatusTxs);
      expect(breakdown[Status.Completed]).toBe(2);
      expect(breakdown[Status.Pending]).toBeUndefined();
      expect(breakdown[Status.Failed]).toBeUndefined();
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should handle empty transaction list", () => {
      const breakdown = deriveStatusBreakdown([]);
      expect(breakdown).toEqual({});
    });

    it("should not include unrepresented statuses", () => {
      const onlyCompleted = transactions.filter(
        (t) => t.status === Status.Completed,
      );
      const breakdown = deriveStatusBreakdown(onlyCompleted);
      expect(Object.keys(breakdown).length).toBe(1);
    });
  });
});

describe("transactions - applyTransactionFilters", () => {
  const transactions: Transaction[] = [
    {
      transactionId: "tx1",
      user: "Alice",
      status: Status.Completed,
      amount: 100,
      date: "2026-02-21",
    },
    {
      transactionId: "tx2",
      user: "Bob",
      status: Status.Pending,
      amount: 50,
      date: "2026-02-21",
    },
    {
      transactionId: "tx-search",
      user: "Charlie",
      status: Status.Failed,
      amount: 75,
      date: "2026-02-21",
    },
  ];

  // Happy Path
  describe("happy path", () => {
    it("should filter by search on transactionId", () => {
      const result = applyTransactionFilters(transactions, {
        search: "tx1",
        status: "",
      });
      expect(result).toHaveLength(1);
      expect(result[0].transactionId).toBe("tx1");
    });

    it("should filter by search on user (case-insensitive)", () => {
      const result = applyTransactionFilters(transactions, {
        search: "alice",
        status: "",
      });
      expect(result).toHaveLength(1);
      expect(result[0].user).toBe("Alice");
    });

    it("should filter by status", () => {
      const result = applyTransactionFilters(transactions, {
        status: Status.Completed,
        search: "",
      });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(Status.Completed);
    });

    it("should filter by All status (no filtering)", () => {
      const result = applyTransactionFilters(transactions, {
        status: "All",
        search: "",
      });
      expect(result).toHaveLength(3);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should handle search with special characters", () => {
      const result = applyTransactionFilters(transactions, {
        search: "tx-search",
        status: "",
      });
      expect(result).toHaveLength(1);
      expect(result[0].transactionId).toBe("tx-search");
    });

    it("should handle case-insensitive search on user", () => {
      const result1 = applyTransactionFilters(transactions, {
        search: "ALICE",
        status: "",
      });
      const result2 = applyTransactionFilters(transactions, {
        search: "alice",
        status: "",
      });
      const result3 = applyTransactionFilters(transactions, {
        search: "AlIcE",
        status: "",
      });
      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
      expect(result3).toHaveLength(1);
    });

    it("should handle empty search string", () => {
      const result = applyTransactionFilters(transactions, {
        search: "",
        status: "",
      });
      expect(result).toHaveLength(3);
    });

    it("should handle single transaction match", () => {
      const result = applyTransactionFilters(transactions, {
        search: "Bob",
        status: "",
      });
      expect(result).toHaveLength(1);
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should return empty array for no matches", () => {
      const result = applyTransactionFilters(transactions, {
        search: "nonexistent",
        status: "",
      });
      expect(result).toHaveLength(0);
    });

    it("should return empty for non-matching status", () => {
      const result = applyTransactionFilters(transactions, {
        status: Status.Completed,
        search: "",
      });
      expect(result.every((t) => t.status === Status.Completed)).toBe(true);
    });

    it("should handle empty transaction list", () => {
      const result = applyTransactionFilters([], {
        search: "test",
        status: "",
      });
      expect(result).toHaveLength(0);
    });

    it("should handle both search and status mismatch", () => {
      const result = applyTransactionFilters(transactions, {
        search: "Alice",
        status: Status.Pending,
      });
      expect(result).toHaveLength(0);
    });
  });
});
