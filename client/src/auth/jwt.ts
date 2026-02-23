type JwtPayload = {
  exp?: number;
  iat?: number;
};

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

export function getTokenExpiryMs(token: string): number | null {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return null;

    const payload = JSON.parse(decodeBase64Url(payloadPart)) as JwtPayload;
    if (!payload.exp) return null;

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isTokenExpired(
  token: string,
  bufferMs: number = 30_000,
  nowMs: number = Date.now(),
): boolean {
  try {
    const [, payloadPart] = token.split(".");
    if (!payloadPart) return true;

    const payload = JSON.parse(decodeBase64Url(payloadPart)) as JwtPayload;
    if (!payload.exp) return true;

    const expiry = payload.exp * 1000;
    let effectiveBuffer = bufferMs;

    // If token TTL is very short (e.g., 30s in dev), a 30s buffer would
    // invalidate it immediately. Use a smaller proportional buffer in that case.
    if (payload.iat) {
      const ttlMs = (payload.exp - payload.iat) * 1000;
      if (ttlMs > 0 && ttlMs <= bufferMs * 2) {
        effectiveBuffer = Math.min(5_000, Math.floor(ttlMs * 0.1));
      }
    }

    return nowMs >= expiry - effectiveBuffer;
  } catch {
    return true;
  }
}
