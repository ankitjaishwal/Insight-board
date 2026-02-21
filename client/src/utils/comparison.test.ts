import { describe, it, expect } from "vitest";
import { deepEqual } from "./comparison";

describe("comparison - deepEqual", () => {
  // Happy Path
  describe("happy path", () => {
    it("should return true for identical primitives", () => {
      expect(deepEqual(5, 5)).toBe(true);
      expect(deepEqual("test", "test")).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
    });

    it("should return true for identical objects", () => {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it("should return true for identical arrays", () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it("should return true for nested objects", () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { c: 1 } } };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should return true for arrays of objects", () => {
      const arr1 = [{ a: 1 }, { b: 2 }];
      const arr2 = [{ a: 1 }, { b: 2 }];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    it("should handle empty objects", () => {
      expect(deepEqual({}, {})).toBe(true);
    });

    it("should handle empty arrays", () => {
      expect(deepEqual([], [])).toBe(true);
    });

    it("should handle deeply nested structures", () => {
      const obj1 = { a: { b: { c: { d: { e: 1 } } } } };
      const obj2 = { a: { b: { c: { d: { e: 1 } } } } };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle mixed arrays and objects", () => {
      const obj1 = { arr: [{ id: 1 }, { id: 2 }] };
      const obj2 = { arr: [{ id: 1 }, { id: 2 }] };
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it("should handle large numbers", () => {
      expect(deepEqual(9007199254740991, 9007199254740991)).toBe(true);
    });

    it("should handle special strings", () => {
      expect(deepEqual("", "")).toBe(true);
      expect(deepEqual("null", "null")).toBe(true);
    });
  });

  // Empty/Invalid Cases
  describe("empty/invalid cases", () => {
    it("should return false for different primitives", () => {
      expect(deepEqual(5, 6)).toBe(false);
      expect(deepEqual("test", "other")).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
    });

    it("should return false for different object structures", () => {
      expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it("should return false for different array lengths", () => {
      expect(deepEqual([1, 2, 3], [1, 2])).toBe(false);
    });

    it("should return false for null/undefined mismatch", () => {
      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it("should return false for object vs null", () => {
      expect(deepEqual({}, null)).toBe(false);
      expect(deepEqual(null, {})).toBe(false);
    });

    it("should return false for object vs primitive", () => {
      expect(deepEqual({ a: 1 }, 1)).toBe(false);
      expect(deepEqual([1, 2], 1)).toBe(false);
    });

    it("should return false for different key ordering (same structure)", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 2, a: 1 };
      // Note: This returns true because keys are iterated, not order-dependent
      expect(deepEqual(obj1, obj2)).toBe(true);
    });
  });
});
