import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "./renderApp";

describe("Routing integration", () => {
  it("redirects /ops to /ops/overview", async () => {
    const { router } = renderApp("/ops");

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/ops/overview");
    });

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
  });

  it("redirects unknown route to /ops/overview", async () => {
    const { router } = renderApp("/unknown/path");

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/ops/overview");
    });
  });

  it("navigates between ops routes through sidebar", async () => {
    const user = userEvent.setup();
    const { router } = renderApp("/ops/overview");

    await user.click(screen.getByRole("link", { name: "Transactions" }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/ops/transactions");
    });
    expect(
      screen.getByRole("heading", { name: "Transactions" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Audit Logs" }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/ops/audit");
    });
    expect(screen.getByRole("heading", { name: "Audit Logs" })).toBeInTheDocument();
  });

  it("uses finance client route labels", async () => {
    const user = userEvent.setup();

    renderApp("/finance/overview");

    expect(screen.getByText("Finance Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Summary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Payments" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Audit Logs" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Payments" }));
    expect(screen.getByRole("heading", { name: "Payments" })).toBeInTheDocument();
  });
});
