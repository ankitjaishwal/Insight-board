import { describe, it, expect } from "vitest";
import { applySorting } from "./sorting";

describe("sorting - applySorting", () => {
  const numericData = [
    { id: 1, amount: 100 },
    { id: 2, amount: 50 },
    { id: 3, amount: 150 },
  ];

  const dateData = [
    { id: 1, date: "2026-01-15" },
    { id: 2, date: "2026-01-10" },
    { id: 3, date: "2026-01-20" },
  ];

  // Happy Path
  describe("happy path", () => {
    it("should sort numbers ascending", () => {
      const result = applySorting(numericData, {
        key: "amount",
        direction: "asc",
      });
      expect(result.map((r) => r.amount)).toEqual([50, 100, 150]);
    });

    it("should sort numbers descending", () => {
      const result = applySorting(numericData, {
        key: "amount",
        direction: "desc",
      });
      expect(result.map((r) => r.amount)).toEqual([150, 100, 50]);
    });

    it("should sort dates ascending", () => {
      const result = applySorting(dateData, {
        key: "date",
        direction: "asc",
      });
      expect(result.map((r) => r.date)).toEqual([
        "2026-01-10",
        "2026-01-15",
        "2026-01-20",
      ]);
    });

    it("should sort dates descending", () => {
      const result = applySorting(dateData, {
        key: "date",
        direction: "desc",
      });
      expect(result.map((r) => r.date)).toEqual([
        "2026-01-20",
        "2026-01-15",
        "2026-01-10",
      ]);
    });

    it("should sort strings alphabetically", () => {
      const data = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
      const result = applySorting(data, { key: "name", direction: "asc" });
      expect(result.map((r) => r.name)).toEqual(["Alice", "Bob", "Charlie"]);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should handle single element array", () => {
      const result = applySorting([{ id: 1, amount: 100 }], {
        key: "amount",
        direction: "asc",
      });
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(100);
    });

    it("should handle duplicate values", () => {
      const data = [
        { id: 1, amount: 100 },
        { id: 2, amount: 100 },
        { id: 3, amount: 50 },
      ];
      const result = applySorting(data, { key: "amount", direction: "asc" });
      expect(result[0].amount).toBe(50);
      expect(result[1].amount).toBe(100);
      expect(result[2].amount).toBe(100);
    });

    it("should handle negative numbers", () => {
      const data = [
        { id: 1, amount: -50 },
        { id: 2, amount: 100 },
        { id: 3, amount: 0 },
      ];
      const result = applySorting(data, { key: "amount", direction: "asc" });
      expect(result.map((r) => r.amount)).toEqual([-50, 0, 100]);
    });

    it("should not mutate original array", () => {
      const original = [...numericData];
      applySorting(numericData, { key: "amount", direction: "desc" });
      expect(numericData).toEqual(original);
    });

    it("should handle very large numbers", () => {
      const data = [
        { id: 1, amount: 999999999 },
        { id: 2, amount: 1 },
        { id: 3, amount: 999999998 },
      ];
      const result = applySorting(data, { key: "amount", direction: "asc" });
      expect(result.map((r) => r.amount)).toEqual([1, 999999998, 999999999]);
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should return array as-is with null sorting", () => {
      const result = applySorting(numericData, null as any);
      expect(result).toEqual(numericData);
    });

    it("should handle empty array", () => {
      const result = applySorting([], { key: "amount", direction: "asc" });
      expect(result).toHaveLength(0);
    });

    it("should handle mixed data types gracefully", () => {
      const data = [{ value: "10" }, { value: "2" }, { value: "20" }];
      const result = applySorting(data, { key: "value", direction: "asc" });
      expect(result.length).toBe(3);
    });
  });
});
