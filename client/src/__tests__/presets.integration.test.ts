import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderApp } from "./renderApp";

describe("Presets integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("creates and reapplies a saved preset", async () => {
    const user = userEvent.setup();

    renderApp("/ops/transactions");

    await user.type(screen.getByPlaceholderText(/search/i), "Alice");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await user.type(screen.getByPlaceholderText(/e\.g\./i), "My Preset");
    await user.click(screen.getByRole("button", { name: /save preset/i }));

    const presetDropdown = await screen.findByRole("combobox");

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("");

    await user.selectOptions(presetDropdown, "My Preset");
    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("Alice");
  });

  it("updates preset after modifying filters", async () => {
    const user = userEvent.setup();

    renderApp("/ops/transactions");

    await user.type(screen.getByPlaceholderText(/search/i), "Alice");
    await user.click(screen.getByRole("button", { name: /save/i }));

    await user.type(screen.getByPlaceholderText(/e\.g\./i), "My Preset");
    await user.click(screen.getByRole("button", { name: /save preset/i }));

    const presetDropdown = await screen.findByRole("combobox");

    await user.clear(screen.getByPlaceholderText(/search/i));
    await user.type(screen.getByPlaceholderText(/search/i), "Bob");

    await user.click(screen.getByRole("button", { name: /update/i }));

    await user.click(screen.getByRole("button", { name: "Clear" }));

    await user.selectOptions(presetDropdown, "My Preset");

    expect(screen.getByPlaceholderText(/search/i)).toHaveValue("Bob");
  });

  it("deletes active preset", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);

    renderApp("/ops/transactions");

    await user.type(screen.getByPlaceholderText(/search/i), "Alice");
    await user.click(screen.getByRole("button", { name: /save/i }));
    await user.type(screen.getByPlaceholderText(/e\.g\./i), "To Delete");
    await user.click(screen.getByRole("button", { name: /save preset/i }));

    await screen.findByRole("combobox");

    await user.click(screen.getByRole("button", { name: "⋮" }));
    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });
});
