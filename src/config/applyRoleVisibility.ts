import type { DashboardConfig } from "./app.config";
import type { Role } from "../types/role";

export function applyRoleVisibility(
  config: DashboardConfig,
  role: Role,
): DashboardConfig {
  return {
    ...config,
    routes: config.routes.filter((r) => !r.roles || r.roles.includes(role)),
    overview: {
      ...config.overview,
      kpis: config.overview.kpis.filter(
        (k) => !k.roles || k.roles.includes(role),
      ),
    },
  };
}
