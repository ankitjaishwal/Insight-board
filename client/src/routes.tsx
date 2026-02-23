import { Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import OverviewPage from "./pages/OverviewPage";
import TransactionsPage from "./pages/TransactionsPage";
import AuditPage from "./pages/AuditPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RouteErrorBoundary from "./components/errors/RouteErrorBoundary";

export const routes = [
  /* ---------- PUBLIC ---------- */

  { path: "/login", element: <LoginPage />, errorElement: <RouteErrorBoundary /> },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
    errorElement: <RouteErrorBoundary />,
  },

  /* ---------- PROTECTED ---------- */

  {
    element: <ProtectedRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/:clientId",
        element: <Layout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { index: true, element: <Navigate to="overview" replace /> },

          { path: "overview", element: <OverviewPage /> },

          { path: "transactions", element: <TransactionsPage /> },

          /* ---------- ADMIN ONLY ---------- */
          {
            element: <ProtectedRoute roles={["ADMIN"]} />,
            children: [{ path: "audit", element: <AuditPage /> }],
          },
        ],
      },
    ],
  },

  /* ---------- FALLBACK ---------- */
  {
    path: "*",
    element: <Navigate to="/ops" replace />,
  },
];
