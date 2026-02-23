import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "./RegisterPage";

const registerApiMock = vi.fn();

vi.mock("../api/authApi", () => ({
  register: (...args: unknown[]) => registerApiMock(...args),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithRouter() {
    const router = createMemoryRouter(
      [
        { path: "/register", element: <RegisterPage /> },
        { path: "/login", element: <div>Login</div> },
      ],
      { initialEntries: ["/register"] },
    );

    return {
      router,
      ...render(<RouterProvider router={router} />),
    };
  }

  it("shows validation error when confirm password does not match", async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByPlaceholderText("Your name"), "Ankit");
    await user.type(screen.getByPlaceholderText("you@example.com"), "ankit@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "password456");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(registerApiMock).not.toHaveBeenCalled();
  });

  it("calls register API and redirects to login on success", async () => {
    const user = userEvent.setup();
    const { router } = renderWithRouter();

    registerApiMock.mockResolvedValue({
      id: "1",
      name: "Ankit",
      email: "ankit@example.com",
      role: "ADMIN",
    });

    await user.type(screen.getByPlaceholderText("Your name"), "Ankit");
    await user.type(screen.getByPlaceholderText("you@example.com"), "ankit@example.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    await user.type(passwordInputs[0], "password123");
    await user.type(passwordInputs[1], "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(registerApiMock).toHaveBeenCalledWith({
        name: "Ankit",
        email: "ankit@example.com",
        password: "password123",
      });
      expect(router.state.location.pathname).toBe("/login");
    });
  });
});
