// routes.tsx
import { Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import OverviewPage from "./pages/OverviewPage";
import TransactionsPage from "./pages/TransactionsPage";
import AuditPage from "./pages/AuditPage";
import ProtectedRoute from "./routes/ProtectedRoute";

export const routes = [
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
          { path: "audit", element: <AuditPage /> },
        ],
      },
    ],
  },

  // { path: "/login", element: <LoginPage /> },

  { path: "*", element: <Navigate to="/ops" replace /> },
];
