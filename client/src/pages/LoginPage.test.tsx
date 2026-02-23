import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";
import type { ReactNode } from "react";

const loginApiMock = vi.fn();
const loginContextMock = vi.fn();
const clearSessionMessageMock = vi.fn();

vi.mock("../api/authApi", () => ({
  login: (...args: unknown[]) => loginApiMock(...args),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: loginContextMock,
    sessionMessage: null,
    clearSessionMessage: clearSessionMessageMock,
  }),
}));

function TestLayout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderWithRouter() {
    const router = createMemoryRouter(
      [
        { path: "/login", element: <LoginPage /> },
        { path: "/ops/overview", element: <div>Overview</div> },
      ],
      { initialEntries: ["/login"] },
    );

    return {
      router,
      ...render(
        <TestLayout>
          <RouterProvider router={router} />
        </TestLayout>,
      ),
    };
  }

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    renderWithRouter();

    await user.type(screen.getByPlaceholderText("you@example.com"), "alice@example.com");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Password is required")).toBeInTheDocument();
    expect(loginApiMock).not.toHaveBeenCalled();
  });

  it("calls login API and context login, then redirects", async () => {
    const user = userEvent.setup();
    const { router } = renderWithRouter();

    loginApiMock.mockResolvedValue({
      token: "jwt-token",
      user: {
        id: "1",
        name: "Alice",
        email: "alice@example.com",
        role: "ADMIN",
      },
    });

    await user.type(screen.getByPlaceholderText("you@example.com"), "alice@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginApiMock).toHaveBeenCalledWith({
        email: "alice@example.com",
        password: "password123",
      });
      expect(loginContextMock).toHaveBeenCalledWith("jwt-token", {
        id: "1",
        name: "Alice",
        email: "alice@example.com",
        role: "ADMIN",
      });
      expect(router.state.location.pathname).toBe("/ops/overview");
    });
  });
});
