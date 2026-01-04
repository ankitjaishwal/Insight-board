import TransactionsTable from "../components/TransactionsTable";
import { transactions } from "../mocks/transactions.mock";

const columns = [
  { header: "Transaction ID", accessor: "transactionId" },
  { header: "User", accessor: "user" },
  { header: "Status", accessor: "status" },
  { header: "Amount", accessor: "amount", alignment: "right" },
  { header: "Date", accessor: "date" },
];

const TransactionsPage = () => {
  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">Transactions</h1>
      <TransactionsTable columns={columns} data={transactions} />
    </>
  );
};

export default TransactionsPage;
