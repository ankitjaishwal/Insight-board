export type SessionExpiredReason = "expired_token" | "unauthorized";

export type SessionExpiredDetail = {
  reason: SessionExpiredReason;
  message: string;
};

type AuthSnapshot = {
  token: string | null;
  expiresAt: number | null;
};

const SESSION_EXPIRED_EVENT = "auth:session-expired";

let authSnapshot: AuthSnapshot = {
  token: null,
  expiresAt: null,
};

export function setAuthSnapshot(snapshot: AuthSnapshot) {
  authSnapshot = snapshot;
}

export function getAuthSnapshot(): AuthSnapshot {
  return authSnapshot;
}

export function emitSessionExpired(detail: SessionExpiredDetail) {
  window.dispatchEvent(
    new CustomEvent<SessionExpiredDetail>(SESSION_EXPIRED_EVENT, { detail }),
  );
}

export function onSessionExpired(
  handler: (detail: SessionExpiredDetail) => void,
): () => void {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<SessionExpiredDetail>;
    handler(customEvent.detail);
  };

  window.addEventListener(SESSION_EXPIRED_EVENT, listener);

  return () => {
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
  };
}
