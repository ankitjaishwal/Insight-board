import { isTokenExpired } from "../auth/jwt";
import {
  emitSessionExpired,
  getAuthSnapshot,
} from "../auth/sessionLifecycle";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const snapshot = getAuthSnapshot();
  const token = snapshot.token ?? localStorage.getItem("token");

  // Prevent sending requests with expired tokens.
  if (token && isTokenExpired(token)) {
    emitSessionExpired({
      reason: "expired_token",
      message: "Session expired. Please sign in again.",
    });
    throw new Error("Session expired");
  }

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    emitSessionExpired({
      reason: "unauthorized",
      message: "Session expired. Please sign in again.",
    });
    throw new Error("Unauthorized");
  }

  return res;
}
