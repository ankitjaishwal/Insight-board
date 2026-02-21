// routes.tsx
import { Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import OverviewPage from "./pages/OverviewPage";
import TransactionsPage from "./pages/TransactionsPage";
import AuditPage from "./pages/AuditPage";

export const routes = [
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
  { path: "*", element: <Navigate to="/ops" replace /> },
];
