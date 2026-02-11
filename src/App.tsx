import { Routes, Route, Navigate } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage";
import Layout from "./components/Layout";
import TransactionsPage from "./pages/TransactionsPage";
import AuditPage from "./pages/AuditPage";

function App() {
  return (
    <Routes>
      <Route path="/:clientId" element={<Layout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="audit" element={<AuditPage />} />
      </Route>

      {/* Optional fallback */}
      <Route path="*" element={<Navigate to="/ops" replace />} />
    </Routes>
  );
}

export default App;
