import { describe, expect, it } from "vitest";
import { getTokenExpiryMs, isTokenExpired } from "./jwt";

function encodeBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function makeToken(payload: Record<string, unknown>): string {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe("auth/jwt", () => {
  it("extracts exp as milliseconds", () => {
    const exp = Math.floor(Date.now() / 1000) + 120;
    const token = makeToken({ exp });

    expect(getTokenExpiryMs(token)).toBe(exp * 1000);
  });

  it("returns null for malformed token", () => {
    expect(getTokenExpiryMs("bad.token")).toBe(null);
  });

  it("uses buffer for normal TTL tokens", () => {
    const nowMs = 1_700_000_000_000;
    const exp = Math.floor((nowMs + 120_000) / 1000);
    const iat = Math.floor(nowMs / 1000);
    const token = makeToken({ exp, iat });

    expect(isTokenExpired(token, 30_000, nowMs + 89_000)).toBe(false);
    expect(isTokenExpired(token, 30_000, nowMs + 90_000)).toBe(true);
  });

  it("uses smaller effective buffer for very short TTL tokens", () => {
    const nowMs = 1_700_000_000_000;
    const iat = Math.floor(nowMs / 1000);
    const exp = iat + 30;
    const token = makeToken({ exp, iat });

    // For 30s token, effective buffer should shrink (<= 5s), not 30s.
    expect(isTokenExpired(token, 30_000, nowMs + 20_000)).toBe(false);
    expect(isTokenExpired(token, 30_000, nowMs + 27_000)).toBe(true);
  });
});
