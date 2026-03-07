import { describe, expect, it } from "vitest";
import { transactionFiltersSchema } from "./transactionFilters.schema";

describe("transactionFilters.schema", () => {
  it("accepts a valid filter payload", () => {
    const result = transactionFiltersSchema.safeParse({
      search: "alice",
      status: ["Completed"],
      from: "2026-01-01",
      to: "2026-01-31",
      minAmount: 10,
      maxAmount: 20,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid date ranges", () => {
    const result = transactionFiltersSchema.safeParse({
      from: "2026-02-01",
      to: "2026-01-01",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid amount ranges", () => {
    const result = transactionFiltersSchema.safeParse({
      minAmount: 50,
      maxAmount: 20,
    });

    expect(result.success).toBe(false);
  });
});
