import { describe, expect, it } from "vitest";
import { validateFilters } from "./filters.validation";

describe("validateFilters", () => {
  it("returns valid for a clean filter set", () => {
    expect(
      validateFilters({
        search: "alice",
        from: "2026-01-01",
        to: "2026-01-31",
        minAmount: 10,
        maxAmount: 20,
      }),
    ).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it("returns a date range error when from is after to", () => {
    const result = validateFilters({
      from: "2026-02-01",
      to: "2026-01-01",
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.dateRange).toBe("From date must be before To date");
  });

  it("returns an amount range error when min exceeds max", () => {
    const result = validateFilters({
      minAmount: 100,
      maxAmount: 10,
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.amountRange).toBe(
      "Minimum amount must be less than maximum",
    );
  });

  it("rejects negative minimum amounts", () => {
    const result = validateFilters({ minAmount: -1 });

    expect(result.isValid).toBe(false);
    expect(result.errors.amountRange).toBe(
      "Minimum amount cannot be negative",
    );
  });

  it("rejects negative maximum amounts", () => {
    const result = validateFilters({ maxAmount: -1 });

    expect(result.isValid).toBe(false);
    expect(result.errors.amountRange).toBe(
      "Maximum amount cannot be negative",
    );
  });
});
