import { describe, expect, it, vi } from "vitest";
import {
  emitSessionExpired,
  getAuthSnapshot,
  onSessionExpired,
  setAuthSnapshot,
} from "./sessionLifecycle";

describe("sessionLifecycle", () => {
  it("stores and returns the auth snapshot", () => {
    setAuthSnapshot({ token: "abc", expiresAt: 123 });

    expect(getAuthSnapshot()).toEqual({ token: "abc", expiresAt: 123 });
  });

  it("emits session expired events to listeners", () => {
    const handler = vi.fn();
    const unsubscribe = onSessionExpired(handler);

    emitSessionExpired({
      reason: "expired_token",
      message: "Session expired",
    });

    expect(handler).toHaveBeenCalledWith({
      reason: "expired_token",
      message: "Session expired",
    });

    unsubscribe();
  });

  it("stops notifying a listener after unsubscribe", () => {
    const handler = vi.fn();
    const unsubscribe = onSessionExpired(handler);

    unsubscribe();
    emitSessionExpired({
      reason: "unauthorized",
      message: "Unauthorized",
    });

    expect(handler).not.toHaveBeenCalled();
  });
});
