import Overview from "../components/Overview";
import { transactions } from "../mocks/transactions.mock";
import { deriveMetrics } from "../utils";

const OverviewPage = () => {
  const metrics = deriveMetrics(transactions);
  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">Overview</h1>
      <Overview metrics={metrics} />
    </>
  );
};

export default OverviewPage;
