import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getMe } from "../api/authApi";
import { getTokenExpiryMs } from "../auth/jwt";
import {
  onSessionExpired,
  setAuthSnapshot,
  type SessionExpiredDetail,
} from "../auth/sessionLifecycle";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  sessionMessage: string | null;
  login: (token: string, user?: User) => void;
  logout: () => void;
  clearSessionMessage: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

/* ---------- PROVIDER ---------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    const existingToken = localStorage.getItem("token");
    return existingToken ? getTokenExpiryMs(existingToken) : null;
  });
  const [loading, setLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const isLoggingOutRef = useRef(false);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const clearSessionMessage = () => {
    setSessionMessage(null);
  };

  const logout = (message?: string) => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    clearLogoutTimer();
    localStorage.removeItem("token");
    setAuthSnapshot({ token: null, expiresAt: null });
    setUser(null);
    setToken(null);
    setExpiresAt(null);
    if (message) {
      setSessionMessage(message);
    }

    // Allow future explicit logout/login cycles after this state transition.
    queueMicrotask(() => {
      isLoggingOutRef.current = false;
    });
  };

  /* ---------- AUTO LOGIN ---------- */
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const tokenExpiry = getTokenExpiryMs(token);
      if (!tokenExpiry || Date.now() >= tokenExpiry) {
        logout("Session expired. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const me = await getMe(token);
        setUser(me);
      } catch {
        logout("Session expired. Please sign in again.");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  // Keep shared auth snapshot updated for non-React consumers (fetchWithAuth).
  useEffect(() => {
    setAuthSnapshot({ token, expiresAt });
  }, [token, expiresAt]);

  // Auto logout timer driven by JWT expiry.
  useEffect(() => {
    clearLogoutTimer();

    if (!token || !expiresAt) return;

    const delay = expiresAt - Date.now();

    if (delay <= 0) {
      logout("Session expired. Please sign in again.");
      return;
    }

    logoutTimerRef.current = window.setTimeout(() => {
      logout("Session expired. Please sign in again.");
    }, delay);

    return () => {
      clearLogoutTimer();
    };
  }, [token, expiresAt]);

  // Global session-expired handler used by fetchWithAuth and future refresh flows.
  useEffect(() => {
    const unsubscribe = onSessionExpired((detail: SessionExpiredDetail) => {
      // AuthContext is the single authority that reacts to expiry events.
      logout(detail.message);
    });

    return () => {
      unsubscribe();
      clearLogoutTimer();
    };
  }, []);

  /* ---------- LOGIN ---------- */
  const login = (jwt: string, nextUser?: User) => {
    const tokenExpiry = getTokenExpiryMs(jwt);

    if (!tokenExpiry || Date.now() >= tokenExpiry) {
      logout("Session expired. Please sign in again.");
      return;
    }

    localStorage.setItem("token", jwt);
    setToken(jwt);
    setExpiresAt(tokenExpiry);
    setSessionMessage(null);
    if (nextUser) {
      setUser(nextUser);
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      token,
      expiresAt,
      sessionMessage,
      login,
      logout: () => logout(),
      clearSessionMessage,
      loading,
    }),
    [user, token, expiresAt, sessionMessage, loading],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/* ---------- HOOK ---------- */
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
