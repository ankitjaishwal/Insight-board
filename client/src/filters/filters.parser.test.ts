import { describe, it, expect } from "vitest";
import { parseFilters } from "./filters.parser";
import { Status } from "../types/transaction";

describe("filters - parseFilters", () => {
  // ============ Happy Path ============
  describe("happy path", () => {
    it("should parse search param", () => {
      const params = new URLSearchParams("search=user123");
      const result = parseFilters(params);
      expect(result.search).toBe("user123");
    });

    it("should parse single status", () => {
      const params = new URLSearchParams("status=Completed");
      const result = parseFilters(params);
      expect(result.status).toEqual([Status.Completed]);
    });

    it("should parse multiple statuses", () => {
      const params = new URLSearchParams("status=Completed,Pending");
      const result = parseFilters(params);
      expect(result.status).toEqual([Status.Completed, Status.Pending]);
    });

    it("should parse date range", () => {
      const params = new URLSearchParams("from=2026-01-01&to=2026-01-31");
      const result = parseFilters(params);
      expect(result.from).toBe("2026-01-01");
      expect(result.to).toBe("2026-01-31");
    });

    it("should parse amount range", () => {
      const params = new URLSearchParams("min=100&max=500");
      const result = parseFilters(params);
      expect(result.minAmount).toBe(100);
      expect(result.maxAmount).toBe(500);
    });

    it("should parse all filters together", () => {
      const params = new URLSearchParams(
        "search=test&status=Completed,Pending&from=2026-01-01&to=2026-01-31&min=100&max=500",
      );
      const result = parseFilters(params);
      expect(result.search).toBe("test");
      expect(result.status).toEqual([Status.Completed, Status.Pending]);
      expect(result.from).toBe("2026-01-01");
      expect(result.to).toBe("2026-01-31");
      expect(result.minAmount).toBe(100);
      expect(result.maxAmount).toBe(500);
    });
  });

  // ============ Edge Cases ============
  describe("edge cases", () => {
    it("should handle partial params", () => {
      const params = new URLSearchParams("search=test&max=500");
      const result = parseFilters(params);
      expect(result.search).toBe("test");
      expect(result.status).toBeUndefined();
      expect(result.from).toBeUndefined();
      expect(result.maxAmount).toBe(500);
    });

    it("should handle zero amount values", () => {
      const params = new URLSearchParams("min=0&max=0");
      const result = parseFilters(params);
      expect(result.minAmount).toBe(0);
      expect(result.maxAmount).toBe(0);
    });

    it("should handle large amount values", () => {
      const params = new URLSearchParams("min=1000000&max=9999999");
      const result = parseFilters(params);
      expect(result.minAmount).toBe(1000000);
      expect(result.maxAmount).toBe(9999999);
    });

    it("should handle search with special characters", () => {
      const params = new URLSearchParams("search=user@123#test");
      const result = parseFilters(params);
      expect(result.search).toBe("user@123#test");
    });

    it("should handle status list with duplicates", () => {
      const params = new URLSearchParams("status=Completed,Completed,Pending");
      const result = parseFilters(params);
      expect(result.status).toBeDefined();
      expect(result.status?.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ============ Empty/Invalid Input ============
  describe("empty/invalid input", () => {
    it("should return empty object for no params", () => {
      const params = new URLSearchParams();
      const result = parseFilters(params);
      expect(Object.keys(result).length).toBe(0);
    });

    it("should ignore empty search param", () => {
      const params = new URLSearchParams("search=");
      const result = parseFilters(params);
      expect(result.search).toBeUndefined();
    });

    it("should ignore empty status param", () => {
      const params = new URLSearchParams("status=");
      const result = parseFilters(params);
      expect(result.status).toBeUndefined();
    });

    it("should ignore invalid numeric amounts (NaN)", () => {
      const params = new URLSearchParams("min=abc&max=xyz");
      const result = parseFilters(params);
      expect(result.minAmount).toBeUndefined();
      expect(result.maxAmount).toBeUndefined();
    });

    it("should ignore empty date fields", () => {
      const params = new URLSearchParams("from=&to=");
      const result = parseFilters(params);
      expect(result.from).toBeUndefined();
      expect(result.to).toBeUndefined();
    });
  });
});
