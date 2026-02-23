import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderApp } from "./renderApp";

describe("Transactions CRUD integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("creates a transaction from modal", async () => {
    const user = userEvent.setup();

    await renderApp("/ops/transactions");

    await user.click(screen.getByRole("button", { name: /add transaction/i }));

    await user.type(screen.getByLabelText(/user name/i), "Bob");
    await user.clear(screen.getByLabelText(/^amount$/i));
    await user.type(screen.getByLabelText(/^amount$/i), "220");
    await user.clear(screen.getByLabelText(/date \(iso\)/i));
    await user.type(
      screen.getByLabelText(/date \(iso\)/i),
      "2026-02-01T10:00:00.000Z",
    );
    await user.selectOptions(screen.getByLabelText(/^status$/i), "COMPLETED");

    await user.click(
      screen.getByRole("button", { name: /create transaction/i }),
    );

    expect(await screen.findByText(/transaction created/i)).toBeInTheDocument();
    expect(await screen.findByText("Bob")).toBeInTheDocument();
  });

  it("edits a transaction from actions menu", async () => {
    const user = userEvent.setup();

    await renderApp("/ops/transactions");
    await screen.findByText("txn-1");

    await user.click(screen.getByRole("button", { name: /transaction actions/i }));
    await user.click(screen.getByRole("button", { name: /^edit$/i }));

    await user.clear(screen.getByLabelText(/user name/i));
    await user.type(screen.getByLabelText(/user name/i), "Alice Updated");

    const saveButton = screen.getByRole("button", { name: /^save$/i });
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    expect(await screen.findByText(/transaction updated/i)).toBeInTheDocument();
    expect(await screen.findByText("Alice Updated")).toBeInTheDocument();
  });

  it("deletes a transaction with confirmation dialog", async () => {
    const user = userEvent.setup();

    await renderApp("/ops/transactions");
    await screen.findByText("txn-1");

    await user.click(screen.getByRole("button", { name: /transaction actions/i }));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    const dialog = screen.getByText(/delete transaction/i).closest("div");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    expect(await screen.findByText(/transaction deleted/i)).toBeInTheDocument();
    expect(screen.queryByText("txn-1")).not.toBeInTheDocument();
  });

  it("hides create and action controls for USER role", async () => {
    await renderApp("/ops/transactions", {
      user: {
        id: "user-1",
        name: "Standard User",
        email: "user@test.com",
        role: "USER",
      },
    });

    expect(
      screen.queryByRole("button", { name: /add transaction/i }),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading transactions/i)).not.toBeInTheDocument();
    });

    const table = screen.getByRole("table");
    expect(within(table).queryByText("Actions")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /transaction actions/i }),
    ).not.toBeInTheDocument();
  });
});
