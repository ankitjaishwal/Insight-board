import Overview from "../components/Overview";
import { useOutletContext } from "react-router-dom";
import { useOverviewQuery } from "../hooks/useOverviewQuery";
import type { DashboardConfig, RouteConfig } from "../config/app.config";

const OverviewPage = () => {
  const { config, activeRoute } = useOutletContext<{
    config: DashboardConfig;
    activeRoute: RouteConfig;
  }>();

  const { data, isLoading, isError, error } = useOverviewQuery();

  if (isLoading) {
    return (
      <p className="text-gray-500 flex items-center justify-center h-full">
        Loading overview...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-red-600 flex items-center justify-center h-full">
        {error}
      </p>
    );
  }

  if (!data) return null;

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        {activeRoute.label}
      </h1>

      <Overview overview={data} config={config} />
    </>
  );
};

export default OverviewPage;
