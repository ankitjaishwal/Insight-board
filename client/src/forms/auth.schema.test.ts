import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth.schema";

describe("auth.schema", () => {
  describe("loginSchema", () => {
    it("accepts valid login payload", () => {
      const parsed = loginSchema.safeParse({
        email: "user@example.com",
        password: "secret",
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const parsed = loginSchema.safeParse({
        email: "not-email",
        password: "secret",
      });

      expect(parsed.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("accepts valid register payload", () => {
      const parsed = registerSchema.safeParse({
        name: "Ankit",
        email: "ankit@example.com",
        password: "password123",
        confirmPassword: "password123",
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects password mismatch", () => {
      const parsed = registerSchema.safeParse({
        name: "Ankit",
        email: "ankit@example.com",
        password: "password123",
        confirmPassword: "password321",
      });

      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.issues[0]?.path).toContain("confirmPassword");
      }
    });
  });
});
