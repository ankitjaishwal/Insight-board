import Overview from "../components/Overview";
import { transactions } from "../mocks/transactions.mock";
import { metricRegistry, type Metrics } from "../registry/metricRegistry";
import { type DashboardConfig, type RouteConfig } from "../config/app.config";
import { useOutletContext } from "react-router-dom";

const OverviewPage = () => {
  const { config, activeRoute } = useOutletContext<{
    config: DashboardConfig;
    activeRoute: RouteConfig;
  }>();

  const metrics = Object.fromEntries(
    config.overview.kpis.map(({ key }) => [
      key,
      metricRegistry[key].derive(transactions),
    ]),
  ) as Metrics;

  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">
        {activeRoute.label}
      </h1>
      <Overview metrics={metrics} config={config} />
    </>
  );
};

export default OverviewPage;
