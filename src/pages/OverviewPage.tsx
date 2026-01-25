import Overview from "../components/Overview";
import { transactions } from "../mocks/transactions.mock";
import { deriveMetrics, deriveStatusBreakdown } from "../utils";

const OverviewPage = () => {
  const metrics = deriveMetrics(transactions);
  const statusBreakdown = deriveStatusBreakdown(transactions);
  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">Overview</h1>
      <Overview metrics={metrics} statusBreakdown={statusBreakdown} />
    </>
  );
};

export default OverviewPage;
