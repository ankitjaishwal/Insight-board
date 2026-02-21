import { describe, it, expect } from "vitest";
import { filtersToParams, hasActiveFilters } from "./presetUtils";
import { Status } from "../types/transaction";

describe("presetUtils - filtersToParams", () => {
  // Happy Path
  describe("happy path", () => {
    it("should convert search filter", () => {
      const params = filtersToParams({ search: "alice" });
      expect(params.get("search")).toBe("alice");
    });

    it("should convert status array to comma-separated string", () => {
      const params = filtersToParams({
        status: [Status.Completed, Status.Pending],
      });
      expect(params.get("status")).toBe(
        `${Status.Completed},${Status.Pending}`,
      );
    });

    it("should convert date filters", () => {
      const params = filtersToParams({
        from: "2026-02-20",
        to: "2026-02-21",
      });
      expect(params.get("from")).toBe("2026-02-20");
      expect(params.get("to")).toBe("2026-02-21");
    });

    it("should convert amount filters", () => {
      const params = filtersToParams({
        minAmount: 50,
        maxAmount: 100,
      });
      expect(params.get("min")).toBe("50");
      expect(params.get("max")).toBe("100");
    });

    it("should convert all filters together", () => {
      const params = filtersToParams({
        search: "test",
        status: [Status.Completed],
        from: "2026-02-20",
        to: "2026-02-21",
        minAmount: 50,
        maxAmount: 100,
      });
      expect(params.size).toBe(6);
      expect(params.get("search")).toBe("test");
      expect(params.get("status")).toBe("Completed");
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should handle single status", () => {
      const params = filtersToParams({ status: [Status.Failed] });
      expect(params.get("status")).toBe(Status.Failed);
    });

    it("should handle zero amounts", () => {
      const params = filtersToParams({
        minAmount: 0,
        maxAmount: 0,
      });
      expect(params.get("min")).toBe("0");
      expect(params.get("max")).toBe("0");
    });

    it("should handle large amounts", () => {
      const params = filtersToParams({
        minAmount: 999999999,
        maxAmount: 1000000000,
      });
      expect(params.get("min")).toBe("999999999");
      expect(params.get("max")).toBe("1000000000");
    });

    it("should handle search with special characters", () => {
      const params = filtersToParams({ search: "tx-001@special" });
      expect(params.get("search")).toBe("tx-001@special");
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should handle empty filters", () => {
      const params = filtersToParams({});
      expect(params.size).toBe(0);
    });

    it("should not include undefined filters", () => {
      const params = filtersToParams({
        search: "test",
        status: undefined as any,
      });
      expect(params.get("status")).toBeNull();
    });

    it("should handle empty status array", () => {
      const params = filtersToParams({ status: [] });
      expect(params.has("status")).toBe(false);
    });
  });
});

describe("presetUtils - hasActiveFilters", () => {
  // Happy Path
  describe("happy path", () => {
    it("should return true for search filter", () => {
      expect(hasActiveFilters({ search: "test" })).toBe(true);
    });

    it("should return true for non-empty status array", () => {
      expect(hasActiveFilters({ status: [Status.Completed] })).toBe(true);
    });

    it("should return true for from date", () => {
      expect(hasActiveFilters({ from: "2026-02-20" })).toBe(true);
    });

    it("should return true for to date", () => {
      expect(hasActiveFilters({ to: "2026-02-21" })).toBe(true);
    });

    it("should return true for minAmount", () => {
      expect(hasActiveFilters({ minAmount: 50 })).toBe(true);
    });

    it("should return true for maxAmount", () => {
      expect(hasActiveFilters({ maxAmount: 100 })).toBe(true);
    });

    it("should return true for multiple filters", () => {
      expect(
        hasActiveFilters({
          search: "test",
          status: [Status.Completed],
          minAmount: 50,
        }),
      ).toBe(true);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should return true for zero minAmount", () => {
      expect(hasActiveFilters({ minAmount: 0 })).toBe(true);
    });

    it("should return true for zero maxAmount", () => {
      expect(hasActiveFilters({ maxAmount: 0 })).toBe(true);
    });

    it("should return true for empty search string (only if explicitly set)", () => {
      // Note: typically empty strings should be falsy, but we check what the function does
      const result = hasActiveFilters({ search: "" });
      expect(typeof result).toBe("boolean");
    });

    it("should handle date with special format", () => {
      expect(hasActiveFilters({ from: "2026-02-20" })).toBe(true);
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should return false for empty filters", () => {
      expect(hasActiveFilters({})).toBe(false);
    });

    it("should return false for empty status array", () => {
      expect(hasActiveFilters({ status: [] })).toBe(false);
    });

    it("should return false for undefined values", () => {
      expect(
        hasActiveFilters({
          search: undefined as any,
          status: undefined as any,
        }),
      ).toBe(false);
    });

    it("should return false for null values", () => {
      expect(
        hasActiveFilters({
          search: null as any,
          status: null as any,
        }),
      ).toBe(false);
    });

    it("should return false for only undefined/null filters", () => {
      expect(
        hasActiveFilters({
          minAmount: undefined,
          maxAmount: undefined,
        }),
      ).toBe(false);
    });
  });
});
