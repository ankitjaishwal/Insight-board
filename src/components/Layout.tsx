import { NavLink, Outlet, useParams } from "react-router-dom";
import { type DashboardConfig } from "../config/app.config";
import { resolveClientConfig } from "../config/clients/clientResolver";

const Header = () => {
  return (
    <header className="h-16 px-6 border-b border-gray-200 text-gray-900 flex items-center justify-between bg-white text-sm font-semibold">
      <strong>InsightBoard</strong>
    </header>
  );
};

const SideNav = ({ config }: { config: DashboardConfig }) => {
  return (
    <aside className="w-60 border-r border-gray-200 bg-white p-4">
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
  const { clientId } = useParams();
  const config = resolveClientConfig(clientId);
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <SideNav config={config} />
        {/* Main */}
        <main className="flex-1 p-6">
          <Outlet context={{ config }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
