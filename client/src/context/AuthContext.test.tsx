import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { getMe } from "../api/authApi";

vi.mock("../api/authApi", () => ({
  getMe: vi.fn(),
}));

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function makeToken(payload: Record<string, unknown>): string {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

const mockedGetMe = getMe as MockedFunction<typeof getMe>;

function TestConsumer() {
  const { user, token, expiresAt, sessionMessage, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="user">{user?.name ?? "none"}</div>
      <div data-testid="token">{token ?? "none"}</div>
      <div data-testid="expiresAt">{expiresAt ?? "none"}</div>
      <div data-testid="sessionMessage">{sessionMessage ?? "none"}</div>
      <button
        onClick={() => {
          const nowSec = Math.floor(Date.now() / 1000);
          const tokenValue = makeToken({ iat: nowSec, exp: nowSec + 120 });
          login(tokenValue, {
            id: "1",
            name: "Alice",
            email: "alice@example.com",
            role: "ADMIN",
          });
        }}
      >
        login
      </button>
      <button
        onClick={() => {
          const nowSec = Math.floor(Date.now() / 1000);
          const tokenValue = makeToken({ iat: nowSec, exp: nowSec + 2 });
          login(tokenValue, {
            id: "1",
            name: "Alice",
            email: "alice@example.com",
            role: "ADMIN",
          });
        }}
      >
        login-short
      </button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockedGetMe.mockReset();
    vi.useRealTimers();
  });

  it("stores token, user and expiresAt on login", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("login"));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Alice");
      expect(screen.getByTestId("token").textContent).not.toBe("none");
      expect(screen.getByTestId("expiresAt").textContent).not.toBe("none");
    });
  });

  it("auto logs out when token expires", async () => {
    vi.useFakeTimers();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("login-short"));
    expect(screen.getByTestId("user")).toHaveTextContent("Alice");

    await act(async () => {
      vi.advanceTimersByTime(2_500);
      await Promise.resolve();
    });

    expect(screen.getByTestId("user")).toHaveTextContent("none");
    expect(screen.getByTestId("sessionMessage")).toHaveTextContent(
      "Session expired. Please sign in again.",
    );
  });

  it("handles repeated session-expired events with single logout", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByText("login"));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Alice");
    });

    act(() => {
      window.dispatchEvent(
        new CustomEvent("auth:session-expired", {
          detail: {
            reason: "unauthorized",
            message: "Session expired. Please sign in again.",
          },
        }),
      );
      window.dispatchEvent(
        new CustomEvent("auth:session-expired", {
          detail: {
            reason: "unauthorized",
            message: "Session expired. Please sign in again.",
          },
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("none");
    });

    expect(localStorage.removeItem).toHaveBeenCalledTimes(1);
  });
});
