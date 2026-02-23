import { Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import OverviewPage from "./pages/OverviewPage";
import TransactionsPage from "./pages/TransactionsPage";
import AuditPage from "./pages/AuditPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export const routes = [
  /* ---------- PUBLIC ---------- */

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  /* ---------- PROTECTED ---------- */

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/:clientId",
        element: <Layout />,
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
