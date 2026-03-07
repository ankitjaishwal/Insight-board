import Overview from "../components/Overview";
import { useOutletContext } from "react-router-dom";
import { useOverviewQuery } from "../hooks/useOverviewQuery";
import type { DashboardConfig, RouteConfig } from "../config/app.config";
import { OverviewSkeleton } from "../components/LoadingSkeletons";

const OverviewPage = () => {
  const { config, activeRoute } = useOutletContext<{
    config: DashboardConfig;
    activeRoute: RouteConfig;
  }>();

  const { data, isLoading, isError, error } = useOverviewQuery();

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (isError) {
    return (
      <p className="flex h-full items-center justify-center text-red-600">
        {error}
      </p>
    );
  }

  if (!data) return null;

  return (
      <>
      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {activeRoute.label}
      </h1>

      <Overview overview={data} config={config} />
    </>
  );
};

export default OverviewPage;
