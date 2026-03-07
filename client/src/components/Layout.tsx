import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useState } from "react";
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

const Header = () => {
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
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur dark:border-slate-700 dark:bg-slate-950/90">
      <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        Insight Board
      </div>

      <div className="flex items-center gap-4">
        {isDemoAdmin && (
          <button
            onClick={handleResetDemo}
            disabled={isResettingDemo}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 shadow-sm transition hover:bg-amber-100 disabled:opacity-60 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
          >
            {isResettingDemo ? "Resetting..." : "Reset Demo"}
          </button>
        )}

        <div className="text-sm text-slate-700 dark:text-slate-200">
          <span className="font-medium">{user.name}</span>
          <span className="ml-1 text-slate-400 dark:text-slate-500">
            ({user.role})
          </span>
        </div>

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
    </header>
  );
};

const SideNav = ({ config }: { config: DashboardConfig }) => {
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
  const { clientId } = useParams();
  const rawConfig = resolveClientConfig(clientId);

  const normalizedRole =
    (user?.role?.toLowerCase() as Role | undefined) ?? "ops";
  const config = applyRoleVisibility(rawConfig, normalizedRole);

  const location = useLocation();

  const activeRoute = config.routes.find((r) =>
    location.pathname.endsWith(r.path),
  );

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
      <Header />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <SideNav config={config} />
        {/* Main */}
        <main className="flex-1 min-h-0 overflow-auto bg-slate-100 p-6 dark:bg-slate-950">
          <div className="mx-auto w-full max-w-[1440px] p-0 sm:p-2">
            <Outlet context={{ config, activeRoute }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
