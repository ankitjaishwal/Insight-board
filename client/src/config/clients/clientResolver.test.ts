import { describe, expect, it } from "vitest";
import { resolveClientConfig } from "./clientResolver";
import { financeConfig } from "./finance.config";
import { opsConfig } from "./ops.config";

describe("resolveClientConfig", () => {
  it("returns ops config by default", () => {
    expect(resolveClientConfig()).toBe(opsConfig);
    expect(resolveClientConfig("unknown")).toBe(opsConfig);
  });

  it("returns finance config for the finance client", () => {
    expect(resolveClientConfig("finance")).toBe(financeConfig);
  });
});

describe("client configs", () => {
  it("keeps ops navigation labels and audit route", () => {
    expect(opsConfig.appName).toBe("Ops Console");
    expect(opsConfig.currency).toBe("INR");
    expect(opsConfig.routes.map((route) => route.label)).toEqual([
      "Overview",
      "Transactions",
      "Audit Logs",
    ]);
  });

  it("keeps finance labels and excludes audit route", () => {
    expect(financeConfig.appName).toBe("Finance Dashboard");
    expect(financeConfig.currency).toBe("USD");
    expect(financeConfig.routes.map((route) => route.label)).toEqual([
      "Summary",
      "Payments",
    ]);
    expect(financeConfig.routes.some((route) => route.key === "audit")).toBe(
      false,
    );
  });
});
