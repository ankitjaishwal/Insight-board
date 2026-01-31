import Overview from "../components/Overview";
import { transactions } from "../mocks/transactions.mock";
import { metricRegistry } from "../registry/metricRegistry";
import { appConfig } from "../config/app.config";
import type { Metrics } from "../types";

const OverviewPage = () => {
  const metrics = Object.fromEntries(
    appConfig.overview.kpis.map((key) => [
      key,
      metricRegistry[key].derive(transactions),
    ]),
  ) as Metrics;

  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">Overview</h1>
      <Overview metrics={metrics} />
    </>
  );
};

export default OverviewPage;
