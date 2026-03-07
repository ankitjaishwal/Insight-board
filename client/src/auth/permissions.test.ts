import { describe, expect, it } from "vitest";
import { permissions, type Role } from "./permissions";

describe("permissions", () => {
  it("allows only admins to access audit", () => {
    expect(permissions.audit).toEqual(["ADMIN"]);
  });

  it("allows supported roles to access transactions", () => {
    const roles = permissions.transactions as Role[];
    expect(roles).toEqual(["ADMIN", "OPS", "FINANCE"]);
    expect(roles).not.toContain("USER");
  });

  it("allows all roles to access overview", () => {
    const roles = permissions.overview as Role[];
    expect(roles).toEqual(["ADMIN", "OPS", "FINANCE", "USER"]);
  });
});
