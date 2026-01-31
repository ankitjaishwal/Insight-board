import type { DashboardConfig } from "../app.config";
import { financeConfig } from "./finance.config";
import { opsConfig } from "./ops.config";

export function resolveClientConfig(clientId?: string): DashboardConfig {
  switch (clientId) {
    case "finance":
      return financeConfig;
    case "ops":
    default:
      return opsConfig;
  }
}
