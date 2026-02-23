import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("disables controls at bounds", () => {
    const onPageChange = vi.fn();
    const onLimitChange = vi.fn();

    const { rerender } = render(
      <Pagination
        page={1}
        pages={3}
        total={60}
        limit={20}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />,
    );

    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();

    rerender(
      <Pagination
        page={3}
        pages={3}
        total={60}
        limit={20}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />,
    );

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("emits page and limit changes", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const onLimitChange = vi.fn();

    render(
      <Pagination
        page={2}
        pages={4}
        total={80}
        limit={20}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Prev" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);

    await user.selectOptions(screen.getByLabelText(/rows per page/i), "50");
    expect(onLimitChange).toHaveBeenCalledWith(50);
  });
});
