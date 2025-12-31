import { Routes, Route, Navigate } from "react-router-dom";
import OverviewPage from "./pages/OverviewPage";
import Layout from "./components/Layout";
import "./App.css";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
