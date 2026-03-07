import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "./ToastContext";

function ToastConsumer() {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast("Saved", "success")}>success</button>
      <button onClick={() => showToast("Failed", "error")}>error</button>
      <button onClick={() => showToast("Careful", "warning")}>warning</button>
    </div>
  );
}

describe("ToastContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders success, error, and warning toasts", async () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "success" }));
      fireEvent.click(screen.getByRole("button", { name: "error" }));
      fireEvent.click(screen.getByRole("button", { name: "warning" }));
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Careful")).toBeInTheDocument();
  });

  it("auto dismisses a toast after three seconds", async () => {
    render(
      <ToastProvider>
        <ToastConsumer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "success" }));
    expect(screen.getByText("Saved")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });
});
