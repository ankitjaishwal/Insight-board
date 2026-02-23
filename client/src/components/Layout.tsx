import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { type DashboardConfig } from "../config/app.config";
import { resolveClientConfig } from "../config/clients/clientResolver";
import { applyRoleVisibility } from "../config/applyRoleVisibility";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/role";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      {/* Left */}
      <div className="text-lg font-semibold text-gray-800">Insight Board</div>

      {/* Right */}
      <div className="flex items-center gap-4">
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
  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white p-4">
      <nav className="flex flex-col gap-2">
        {config.routes.map((navItem) => (
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
        ))}
      </nav>
    </aside>
  );
};

const Layout = () => {
  const { user } = useAuth();
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
      <Header />
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <SideNav config={config} />
        {/* Main */}
        <main className="flex-1 min-h-0 overflow-auto p-6">
          <Outlet context={{ config, activeRoute }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
