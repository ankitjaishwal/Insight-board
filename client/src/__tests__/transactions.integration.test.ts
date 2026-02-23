import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderApp } from "./renderApp";

describe("Transactions filters integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("syncs search with URL", async () => {
    const user = userEvent.setup();
    const { router } = await renderApp("/ops/transactions");

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "Alice");

    await waitFor(() => {
      expect(router.state.location.search).toContain("search=Alice");
    });
  });

  it("removes search from URL when clear-search button is clicked", async () => {
    const user = userEvent.setup();
    const { router } = await renderApp("/ops/transactions");

    await user.type(screen.getByPlaceholderText(/search/i), "Alice");
    await user.click(screen.getByRole("button", { name: /clear search/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search/i)).toHaveValue("");
      expect(router.state.location.search).not.toContain("search=");
    });
  });

  it("syncs status checkboxes with URL", async () => {
    const user = userEvent.setup();
    const { router } = await renderApp("/ops/transactions");

    await user.click(screen.getByRole("checkbox", { name: "Completed" }));
    await user.click(screen.getByRole("checkbox", { name: "Failed" }));

    await waitFor(() => {
      expect(router.state.location.search).toContain("status=Completed%2CFailed");
    });

    await user.click(screen.getByRole("checkbox", { name: "Completed" }));
    await waitFor(() => {
      expect(router.state.location.search).toContain("status=Failed");
    });
  });

  it("syncs advanced date and amount filters with URL", async () => {
    const user = userEvent.setup();
    const { router } = await renderApp("/ops/transactions");

    await user.click(screen.getByRole("button", { name: /advanced/i }));

    await user.type(screen.getByLabelText("From"), "2026-01-01");
    await user.type(screen.getByLabelText("To"), "2026-01-31");
    await user.type(screen.getByLabelText("Min"), "100");
    await user.type(screen.getByLabelText("Max"), "500");

    await waitFor(() => {
      expect(router.state.location.search).toContain("from=2026-01-01");
      expect(router.state.location.search).toContain("to=2026-01-31");
      expect(router.state.location.search).toContain("min=100");
      expect(router.state.location.search).toContain("max=500");
    });
  });
});
