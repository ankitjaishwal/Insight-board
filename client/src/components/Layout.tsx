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

const Header = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isDemoAdmin = user?.email === DEMO_EMAIL && user?.role === "ADMIN";
  const [isResettingDemo, setIsResettingDemo] = useState(false);

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
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      {/* Left */}
      <div className="text-lg font-semibold text-gray-800">Insight Board</div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {isDemoAdmin && (
          <button
            onClick={handleResetDemo}
            disabled={isResettingDemo}
            className="text-sm px-3 py-1.5 rounded border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-60"
          >
            {isResettingDemo ? "Resetting..." : "Reset Demo"}
          </button>
        )}

        <div className="text-sm text-gray-700">
          <span className="font-medium">{user.name}</span>
          <span className="ml-1 text-gray-400">({user.role})</span>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1.5 rounded border hover:bg-gray-100"
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
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white p-4">
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
                `px-3 py-2 rounded-md text-md ${
                  isActive
                    ? "bg-blue-50 text-blue-500 font-medium"
                    : "text-gray-700 bg-transparent"
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
    <div className="flex flex-col h-screen overflow-hidden">
      {isDemoUser && (
        <div className="bg-yellow-100 text-yellow-900 px-4 py-2 text-sm border-b border-yellow-300">
          🟡 Demo Mode — Data may reset anytime
        </div>
      )}
      {sessionMessage && (
        <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm flex justify-between items-center">
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
        <main className="flex-1 min-h-0 overflow-auto p-6 bg-gray-50">
          <div className="p-6">
            <Outlet context={{ config, activeRoute }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
