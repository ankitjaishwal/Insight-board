import { describe, expect, it } from "vitest";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "./transactionCrud.schema";

describe("transactionCrud.schema", () => {
  it("accepts a valid create payload", () => {
    const result = createTransactionSchema.safeParse({
      userName: "Alice",
      amount: 99.5,
      date: "2026-01-10T10:00:00.000Z",
      status: "COMPLETED",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid create payloads", () => {
    const result = createTransactionSchema.safeParse({
      userName: "A",
      amount: 0,
      date: "invalid",
      status: "PENDING",
    });

    expect(result.success).toBe(false);
  });

  it("allows partial updates", () => {
    const result = updateTransactionSchema.safeParse({
      status: "FAILED",
    });

    expect(result.success).toBe(true);
  });
});
