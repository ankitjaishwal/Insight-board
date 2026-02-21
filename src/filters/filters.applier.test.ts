import { describe, it, expect } from "vitest";
import { applyFilters } from "./filters.applier";
import { Status } from "../types/transaction";
import type { Transaction } from "../types/transaction";
import type { TransactionFilters } from "../types/transactionFilters";

const mockTransactions: Transaction[] = [
  {
    transactionId: "TX001",
    user: "Alice",
    amount: 150,
    status: Status.Completed,
    date: "2026-01-15",
  },
  {
    transactionId: "TX002",
    user: "Bob",
    amount: 250,
    status: Status.Pending,
    date: "2026-01-20",
  },
  {
    transactionId: "TX003",
    user: "alice_secondary",
    amount: 75,
    status: Status.Failed,
    date: "2026-01-25",
  },
  {
    transactionId: "TX004",
    user: "Charlie",
    amount: 500,
    status: Status.Completed,
    date: "2026-02-01",
  },
];

describe("filters - applyFilters", () => {
  // ============ Happy Path ============
  describe("happy path", () => {
    it("should return all transactions when no filters applied", () => {
      const filters: TransactionFilters = {};
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(4);
    });

    it("should filter by search term (transaction ID)", () => {
      const filters: TransactionFilters = { search: "TX001" };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(1);
      expect(result[0].transactionId).toBe("TX001");
    });

    it("should filter by search term (username, case-insensitive)", () => {
      const filters: TransactionFilters = { search: "alice" };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(2);
      expect(result.every((tx) => tx.user.toLowerCase().includes("alice")));
    });

    it("should filter by single status", () => {
      const filters: TransactionFilters = { status: [Status.Completed] };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(2);
      expect(result.every((tx) => tx.status === Status.Completed));
    });

    it("should filter by multiple statuses (OR logic)", () => {
      const filters: TransactionFilters = {
        status: [Status.Completed, Status.Pending],
      };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(3);
    });

    it("should filter by date range (from only)", () => {
      const filters: TransactionFilters = { from: "2026-01-20" };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(3);
    });

    it("should filter by date range (to only)", () => {
      const filters: TransactionFilters = { to: "2026-01-20" };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(2);
    });

    it("should filter by date range (both)", () => {
      const filters: TransactionFilters = {
        from: "2026-01-20",
        to: "2026-01-31",
      };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(2);
    });

    it("should filter by amount range (min only)", () => {
      const filters: TransactionFilters = { minAmount: 200 };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(2);
      expect(result.every((tx) => tx.amount >= 200));
    });

    it("should filter by amount range (max only)", () => {
      const filters: TransactionFilters = { maxAmount: 200 };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(2);
      expect(result.every((tx) => tx.amount <= 200));
    });

    it("should filter by amount range (both)", () => {
      const filters: TransactionFilters = { minAmount: 100, maxAmount: 300 };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(2);
    });

    it("should apply multiple filters (AND logic)", () => {
      const filters: TransactionFilters = {
        search: "alice",
        status: [Status.Completed],
        minAmount: 100,
      };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(1);
      expect(result[0].transactionId).toBe("TX001");
    });
  });

  // ============ Edge Cases ============
  describe("edge cases", () => {
    it("should handle boundary date matches (exact date equality)", () => {
      const filters: TransactionFilters = {
        from: "2026-01-15",
        to: "2026-01-15",
      };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe("2026-01-15");
    });

    it("should handle boundary amount matches (exact amount equality)", () => {
      const filters: TransactionFilters = {
        minAmount: 150,
        maxAmount: 150,
      };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(150);
    });

    it("should handle search with partial match", () => {
      const filters: TransactionFilters = { search: "TX0" };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(4);
    });

    it("should handle zero amount", () => {
      const filters: TransactionFilters = { minAmount: 0, maxAmount: 100 };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(75);
    });

    it("should return empty array when no transactions match date range", () => {
      const filters: TransactionFilters = { from: "2026-03-01" };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(0);
    });

    it("should handle search case-insensitivity", () => {
      const filters1: TransactionFilters = { search: "ALICE" };
      const filters2: TransactionFilters = { search: "alice" };
      const result1 = applyFilters(mockTransactions, filters1);
      const result2 = applyFilters(mockTransactions, filters2);
      expect(result1).toEqual(result2);
    });
  });

  // ============ Empty/Invalid Input ============
  describe("empty/invalid input", () => {
    it("should return empty array for empty transaction list", () => {
      const filters: TransactionFilters = { search: "test" };
      const result = applyFilters([], filters);
      expect(result).toHaveLength(0);
    });

    it("should return empty array when search doesn't match", () => {
      const filters: TransactionFilters = { search: "NONEXISTENT" };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(0);
    });

    it("should return empty array when no status matches", () => {
      const filters: TransactionFilters = { status: [] };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(4);
    });

    it("should return empty array when date range has no matches", () => {
      const filters: TransactionFilters = {
        from: "2026-02-01",
        to: "2026-02-01",
      };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(1);
    });

    it("should return empty array when amount range has no matches", () => {
      const filters: TransactionFilters = { minAmount: 1000, maxAmount: 9999 };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(0);
    });

    it("should handle undefined filter fields (skip filtering)", () => {
      const filters: TransactionFilters = {
        search: undefined,
        status: undefined,
      };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(4);
    });

    it("should handle very restrictive combined filters", () => {
      const filters: TransactionFilters = {
        search: "Alice",
        status: [Status.Pending],
        minAmount: 1000,
      };
      const result = applyFilters(mockTransactions, filters);
      expect(result).toHaveLength(0);
    });
  });
});
