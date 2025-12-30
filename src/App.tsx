import { Routes, Route, Link, Navigate } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage";

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Overview</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
      </Routes>
    </div>
  );
}

export default App;
