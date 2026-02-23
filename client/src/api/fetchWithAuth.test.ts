import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWithAuth } from "./fetchWithAuth";
import { isTokenExpired } from "../auth/jwt";
import {
  emitSessionExpired,
  getAuthSnapshot,
} from "../auth/sessionLifecycle";

vi.mock("../auth/jwt", () => ({
  isTokenExpired: vi.fn(),
}));

vi.mock("../auth/sessionLifecycle", () => ({
  emitSessionExpired: vi.fn(),
  getAuthSnapshot: vi.fn(),
}));

describe("fetchWithAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("blocks request when token is expired and emits session event", async () => {
    vi.mocked(getAuthSnapshot).mockReturnValue({
      token: "expired.token",
      expiresAt: Date.now() - 1,
    });
    vi.mocked(isTokenExpired).mockReturnValue(true);

    await expect(fetchWithAuth("/api/test")).rejects.toThrow("Session expired");

    expect(emitSessionExpired).toHaveBeenCalledWith({
      reason: "expired_token",
      message: "Session expired. Please sign in again.",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("emits unauthorized event on 401 response", async () => {
    vi.mocked(getAuthSnapshot).mockReturnValue({
      token: "valid.token",
      expiresAt: Date.now() + 10000,
    });
    vi.mocked(isTokenExpired).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({
      status: 401,
    } as Response);

    await expect(fetchWithAuth("/api/test")).rejects.toThrow("Unauthorized");

    expect(emitSessionExpired).toHaveBeenCalledWith({
      reason: "unauthorized",
      message: "Session expired. Please sign in again.",
    });
  });

  it("attaches auth header for valid token", async () => {
    vi.mocked(getAuthSnapshot).mockReturnValue({
      token: "valid.token",
      expiresAt: Date.now() + 10000,
    });
    vi.mocked(isTokenExpired).mockReturnValue(false);
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
    } as Response);

    await fetchWithAuth("/api/test", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer valid.token",
          "Content-Type": "application/json",
        }),
      }),
    );
  });
});
