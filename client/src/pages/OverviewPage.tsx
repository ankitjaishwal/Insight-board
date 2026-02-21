import Overview from "../components/Overview";
import { useOutletContext } from "react-router-dom";
import { useOverviewQuery } from "../hooks/useOverviewQuery";
import type { DashboardConfig, RouteConfig } from "../config/app.config";

const OverviewPage = () => {
  const { config, activeRoute } = useOutletContext<{
    config: DashboardConfig;
    activeRoute: RouteConfig;
  }>();

  const { data, loading, error } = useOverviewQuery();

  if (loading) {
    return <p className="text-gray-500">Loading overview...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!data) return null;

  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">
        {activeRoute.label}
      </h1>

      <Overview overview={data} config={config} />
    </>
  );
};

export default OverviewPage;
