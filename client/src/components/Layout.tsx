import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { type DashboardConfig } from "../config/app.config";
import { resolveClientConfig } from "../config/clients/clientResolver";
import { applyRoleVisibility } from "../config/applyRoleVisibility";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/role";
import { usePermission } from "../hooks/usePermission";
import { DEMO_EMAIL } from "../config/demo";
import { resetDemoData } from "../api/adminApi";
import { useToast } from "../context/ToastContext";
import { reloadPage } from "../utils/browser";
import { useTheme } from "../context/ThemeContext";

const Header = ({
  onToggleNav,
}: {
  onToggleNav: () => void;
}) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isDemoAdmin = user?.email === DEMO_EMAIL && user?.role === "ADMIN";
  const [isResettingDemo, setIsResettingDemo] = useState(false);
  const { currentTheme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleResetDemo = async () => {
    try {
      setIsResettingDemo(true);
      await resetDemoData();
      showToast("Demo data reset successfully", "success");

      setTimeout(() => {
        reloadPage();
      }, 600);
    } catch (error: any) {
      showToast(error?.message || "Failed to reset demo data", "error");
    } finally {
      setIsResettingDemo(false);
    }
  };

  if (!user) return null;

  return (
    <header className="border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 dark:border-slate-700 dark:bg-slate-950/90">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleNav}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <span className="space-y-1.5" aria-hidden="true">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>

          <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Insight Board
          </div>
        </div>

        <div className="flex flex-col gap-3 md:min-w-0 md:flex-row md:items-center md:justify-end">
          <div className="min-w-0 text-sm text-slate-700 md:text-right dark:text-slate-200">
            <span className="font-medium">{user.name}</span>
            <span className="ml-1 text-slate-400 dark:text-slate-500">
              ({user.role})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:flex-nowrap">
            {isDemoAdmin && (
              <button
                onClick={handleResetDemo}
                disabled={isResettingDemo}
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 shadow-sm transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
              >
                {isResettingDemo ? "Resetting..." : "Reset Demo"}
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className="ui-button-secondary px-3 py-1.5"
              aria-label={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} mode`}
            >
              {currentTheme === "dark" ? "☀" : "🌙"}
            </button>

            <button
              onClick={handleLogout}
              className="ui-button-secondary px-3 py-1.5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const SideNav = ({
  config,
  onNavigate,
}: {
  config: DashboardConfig;
  onNavigate?: () => void;
}) => {
  const canViewAudit = usePermission("audit");

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <nav className="flex flex-col gap-2">
        {config.routes.map((navItem) => {
          if (navItem.key === "audit" && !canViewAudit) {
            return null;
          }

          return (
            <NavLink
              key={navItem.key}
              to={navItem.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"
                    : "bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`
              }
            >
              {navItem.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

const Layout = () => {
  const { user, sessionMessage, clearSessionMessage } = useAuth();
  const isDemoUser = user?.email === DEMO_EMAIL;
  const canViewAudit = usePermission("audit");
  const { clientId } = useParams();
  const rawConfig = resolveClientConfig(clientId);

  const normalizedRole =
    (user?.role?.toLowerCase() as Role | undefined) ?? "ops";
  const config = applyRoleVisibility(rawConfig, normalizedRole);

  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeRoute = config.routes.find((r) =>
    location.pathname.endsWith(r.path),
  );

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
      {isDemoUser && (
        <div className="border-b border-yellow-300 bg-yellow-100 px-4 py-2 text-sm text-yellow-900 dark:border-yellow-500/40 dark:bg-yellow-500/10 dark:text-yellow-200">
          🟡 Demo Mode — Data may reset anytime
        </div>
      )}
      {sessionMessage && (
        <div className="flex items-center justify-between bg-amber-100 px-4 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <span>{sessionMessage}</span>

          <button
            onClick={clearSessionMessage}
            className="text-xs font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <Header onToggleNav={() => setIsMobileNavOpen((open) => !open)} />
      {isMobileNavOpen && (
        <div className="border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden dark:border-slate-700 dark:bg-slate-950/95">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Navigation
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeRoute?.label ?? "Dashboard"}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close navigation menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsMobileNavOpen(false)}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </button>
          </div>

          <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {config.routes.map((navItem) => {
              const canRenderAudit = navItem.key !== "audit" || canViewAudit;

              if (!canRenderAudit) {
                return null;
              }

              const isActive = location.pathname.endsWith(navItem.path);

              return (
                <NavLink
                  key={navItem.key}
                  to={navItem.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`rounded-lg px-3 py-3 text-sm transition ${
                    isActive
                      ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {navItem.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        <div className="hidden md:block">
          <SideNav config={config} />
        </div>
        {/* Main */}
        <main className="flex-1 min-h-0 overflow-auto bg-slate-100 p-4 sm:p-5 lg:p-6 dark:bg-slate-950">
          <div className="mx-auto w-full max-w-[1440px]">
            <Outlet context={{ config, activeRoute }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
