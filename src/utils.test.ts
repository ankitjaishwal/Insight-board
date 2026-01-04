import { describe, it, expect } from "vitest";
import { deriveMetrics } from "./utils";
import { type Transaction } from "./mocks/transactions.mock";

describe("deriveMetrics", () => {
  it("should return correct metrics for empty transaction", () => {
    const result = deriveMetrics([]);
    expect(result).toEqual({
      totalUsers: 0,
      totalTransactions: 0,
      totalAmount: 0,
      successRate: 0,
    });
  });

  it("should calculate totalUsers correctly with unique users", () => {
    const transactions: Transaction[] = [
      {
        user: "user1",
        amount: 100,
        status: "Completed",
        transactionId: "TXN-12345",
        date: "1 Jan 2026",
      },
      {
        user: "user2",
        amount: 200,
        status: "Completed",
        transactionId: "TXN-12346",
        date: "2 Jan 2026",
      },
      {
        user: "user1",
        amount: 150,
        status: "Completed",
        transactionId: "TXN-12347",
        date: "3 Jan 2026",
      },
    ];
    const result = deriveMetrics(transactions);
    expect(result.totalUsers).toBe(2);
  });

  it("should calculate totalTransactions correctly", () => {
    const transactions: Transaction[] = [
      {
        user: "user1",
        amount: 100,
        status: "Completed",
        transactionId: "TXN-12345",
        date: "1 Jan 2026",
      },
      {
        user: "user2",
        amount: 200,
        status: "Failed",
        transactionId: "TXN-12346",
        date: "2 Jan 2026",
      },
      {
        user: "user3",
        amount: 150,
        status: "Pending",
        transactionId: "TXN-12347",
        date: "3 Jan 2026",
      },
    ];
    const result = deriveMetrics(transactions);
    expect(result.totalTransactions).toBe(3);
  });

  it("should only sum amounts for Completed transactions", () => {
    const transactions: Transaction[] = [
      {
        user: "user1",
        amount: 100,
        status: "Completed",
        transactionId: "TXN-12348",
        date: "4 Jan 2026",
      },
      {
        user: "user2",
        amount: 200,
        status: "Failed",
        transactionId: "TXN-12349",
        date: "5 Jan 2026",
      },
      {
        user: "user3",
        amount: 150,
        status: "Pending",
        transactionId: "TXN-12350",
        date: "6 Jan 2026",
      },
      {
        user: "user4",
        amount: 50,
        status: "Completed",
        transactionId: "TXN-12351",
        date: "7 Jan 2026",
      },
    ];
    const result = deriveMetrics(transactions);
    expect(result.totalAmount).toBe(150);
  });

  it("should calculate successRate correctly with all completed", () => {
    const transactions: Transaction[] = [
      {
        user: "user1",
        amount: 100,
        status: "Completed",
        transactionId: "TXN-12352",
        date: "8 Jan 2026",
      },
      {
        user: "user2",
        amount: 200,
        status: "Completed",
        transactionId: "TXN-12353",
        date: "9 Jan 2026",
      },
    ];
    const result = deriveMetrics(transactions);
    expect(result.successRate).toBe(100);
  });

  it("should calculate successRate correctly with mixed statuses", () => {
    const transactions: Transaction[] = [
      {
        user: "user1",
        amount: 100,
        status: "Completed",
        transactionId: "TXN-12354",
        date: "10 Jan 2026",
      },
      {
        user: "user2",
        amount: 200,
        status: "Failed",
        transactionId: "TXN-12355",
        date: "11 Jan 2026",
      },
      {
        user: "user3",
        amount: 150,
        status: "Pending",
        transactionId: "TXN-12356",
        date: "12 Jan 2026",
      },
    ];
    const result = deriveMetrics(transactions);
    expect(result.successRate).toBeCloseTo(33.33, 1);
  });
});
