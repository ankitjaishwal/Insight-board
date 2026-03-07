import { describe, expect, it } from "vitest";
import { applyRoleVisibility } from "./applyRoleVisibility";
import { opsConfig } from "./clients/ops.config";
import { financeConfig } from "./clients/finance.config";

describe("applyRoleVisibility", () => {
  it("keeps admin-only routes visible for admins", () => {
    const result = applyRoleVisibility(opsConfig, "admin");

    expect(result.routes.map((route) => route.key)).toContain("audit");
  });

  it("hides restricted routes for non-admin roles", () => {
    const result = applyRoleVisibility(opsConfig, "ops");

    expect(result.routes.map((route) => route.key)).not.toContain("audit");
  });

  it("filters KPI visibility by role", () => {
    const result = applyRoleVisibility(financeConfig, "finance");

    expect(result.overview.kpis.map((kpi) => kpi.key)).toContain("totalRevenue");
    expect(result.overview.kpis.map((kpi) => kpi.key)).not.toContain("totalUsers");
  });
});
