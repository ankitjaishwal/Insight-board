import TransactionsTable from "../components/TransactionsTable";
import { transactions } from "../mocks/transactions.mock";
import type { TransactionColumn } from "../types";
import { formatDate } from "../utils";

const columns: TransactionColumn[] = [
  { key: "transactionId", header: "Transaction ID" },
  { key: "user", header: "User" },
  { key: "status", header: "Status" },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (value) => `$${value}`,
  },
  {
    key: "date",
    header: "Date",
    render: (value) => formatDate(value as string),
  },
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
