import { NavLink, Outlet } from "react-router-dom";

const Header = () => {
  return (
    <header className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-white">
      <strong>InsightBoard</strong>
    </header>
  );
};

const SideNav = () => {
  return (
    <aside className="w-60 border-r border-gray-200 bg-white p-4">
      <nav className="flex flex-col gap-2">
        <NavLink
          to="/overview"
          className={({ isActive }) =>
            `px-3 py-2 rounded-md text-md ${
              isActive
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`
          }
        >
          Overview
        </NavLink>
      </nav>
    </aside>
  );
};

const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <SideNav />
        {/* Main */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
