import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../api/adminApi", () => ({
  resetDemoData: vi.fn().mockResolvedValue({ success: true }),
}));
vi.mock("../utils/browser", () => ({
  reloadPage: vi.fn(),
}));

import { renderApp } from "./renderApp";
import { DEMO_EMAIL } from "../config/demo";
import { resetDemoData } from "../api/adminApi";
import { reloadPage } from "../utils/browser";

describe("Demo mode integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("shows demo banner and reset button for demo admin", async () => {
    await renderApp("/ops/transactions", {
      user: {
        id: "demo-user",
        name: "Demo Admin",
        email: DEMO_EMAIL,
        role: "ADMIN",
      },
    });

    expect(
      screen.getByText(/demo mode — data may reset anytime/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset demo/i }),
    ).toBeInTheDocument();
  });

  it("hides demo banner and reset button for non-demo users", async () => {
    await renderApp("/ops/transactions", {
      user: {
        id: "admin-user",
        name: "Admin",
        email: "admin@test.com",
        role: "ADMIN",
      },
    });

    expect(
      screen.queryByText(/demo mode — data may reset anytime/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /reset demo/i }),
    ).not.toBeInTheDocument();
  });

  it("calls reset endpoint and shows success toast on reset click", async () => {
    const user = userEvent.setup({
      delay: null,
    });

    await renderApp("/ops/transactions", {
      user: {
        id: "demo-user",
        name: "Demo Admin",
        email: DEMO_EMAIL,
        role: "ADMIN",
      },
    });

    await user.click(screen.getByRole("button", { name: /reset demo/i }));

    await waitFor(() => {
      expect(resetDemoData).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/demo data reset successfully/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(reloadPage).toHaveBeenCalledTimes(1);
    });
  });
});
