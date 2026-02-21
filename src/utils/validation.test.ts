import { describe, it, expect } from "vitest";
import { validateFilters } from "./validation";

describe("validation - validateFilters", () => {
  // Happy Path
  describe("happy path", () => {
    it("should pass empty filters", () => {
      const result = validateFilters({});
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should pass valid date range", () => {
      const result = validateFilters({
        from: "2026-02-20",
        to: "2026-02-21",
      });
      expect(result.valid).toBe(true);
    });

    it("should pass valid amount range", () => {
      const result = validateFilters({
        minAmount: 50,
        maxAmount: 100,
      });
      expect(result.valid).toBe(true);
    });

    it("should pass with search and status", () => {
      const result = validateFilters({
        search: "test",
        status: ["Completed"],
      });
      expect(result.valid).toBe(true);
    });

    it("should pass with all filters valid", () => {
      const result = validateFilters({
        search: "test",
        status: ["Completed"],
        from: "2026-02-20",
        to: "2026-02-21",
        minAmount: 50,
        maxAmount: 100,
      });
      expect(result.valid).toBe(true);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should pass when from equals to date", () => {
      const result = validateFilters({
        from: "2026-02-20",
        to: "2026-02-20",
      });
      expect(result.valid).toBe(true);
    });

    it("should pass when minAmount equals maxAmount", () => {
      const result = validateFilters({
        minAmount: 100,
        maxAmount: 100,
      });
      expect(result.valid).toBe(true);
    });

    it("should pass with zero amount", () => {
      const result = validateFilters({
        minAmount: 0,
        maxAmount: 0,
      });
      expect(result.valid).toBe(true);
    });

    it("should pass with large amount values", () => {
      const result = validateFilters({
        minAmount: 0,
        maxAmount: 999999999,
      });
      expect(result.valid).toBe(true);
    });

    it("should pass with only from date", () => {
      const result = validateFilters({
        from: "2026-02-20",
      });
      expect(result.valid).toBe(true);
    });

    it("should pass with only to date", () => {
      const result = validateFilters({
        to: "2026-02-21",
      });
      expect(result.valid).toBe(true);
    });

    it("should pass with only minAmount", () => {
      const result = validateFilters({
        minAmount: 50,
      });
      expect(result.valid).toBe(true);
    });

    it("should pass with only maxAmount", () => {
      const result = validateFilters({
        maxAmount: 100,
      });
      expect(result.valid).toBe(true);
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should fail when from date is after to date", () => {
      const result = validateFilters({
        from: "2026-02-21",
        to: "2026-02-20",
      });
      expect(result.valid).toBe(false);
      expect(result.errors.to).toBeDefined();
    });

    it("should fail when minAmount > maxAmount", () => {
      const result = validateFilters({
        minAmount: 100,
        maxAmount: 50,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.maxAmount).toBeDefined();
    });

    it("should fail for negative minAmount", () => {
      const result = validateFilters({
        minAmount: -10,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.minAmount).toBeDefined();
    });

    it("should fail for negative maxAmount", () => {
      const result = validateFilters({
        maxAmount: -50,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.maxAmount).toBeDefined();
    });

    it("should fail for both negative amounts", () => {
      const result = validateFilters({
        minAmount: -100,
        maxAmount: -50,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.minAmount).toBeDefined();
      expect(result.errors.maxAmount).toBeDefined();
    });

    it("should report multiple errors", () => {
      const result = validateFilters({
        from: "2026-02-21",
        to: "2026-02-20",
        minAmount: 100,
        maxAmount: 50,
      });
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it("should fail when minAmount is negative but maxAmount is positive", () => {
      const result = validateFilters({
        minAmount: -50,
        maxAmount: 100,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.minAmount).toBeDefined();
    });
  });
});
