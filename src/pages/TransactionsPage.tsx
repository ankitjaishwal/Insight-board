import { useSearchParams } from "react-router-dom";
import TransactionsTable from "../components/TransactionsTable";
import { transactions } from "../mocks/transactions.mock";
import type { Transaction, TransactionColumn } from "../types";
import { applySorting, formatDate } from "../utils";
import { Status } from "../types/transaction";
import { useState } from "react";

const columns: TransactionColumn[] = [
  { key: "transactionId", header: "Transaction ID", sortable: true },
  { key: "user", header: "User" },
  { key: "status", header: "Status" },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (value) => `$${value}`,
    sortable: true,
  },
  {
    key: "date",
    header: "Date",
    render: (value) => formatDate(value as string),
    sortable: true,
  },
];

const TransactionsPage = () => {
  const [sorting, setSorting] = useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);

  const [searchParams] = useSearchParams();
  const status = searchParams.get("status");

  const filteredTransactions =
    status === "completed"
      ? transactions.filter((t) => t.status === Status.Completed)
      : transactions;

  const sortedTransactions = applySorting(filteredTransactions, sorting);

  const handleSorting = (key: keyof Transaction) => {
    setSorting((prev) => {
      if (!prev || prev.key !== key) {
        return { key: key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key: key, direction: "desc" };
      }

      return null;
    });
  };

  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">Transactions</h1>
      <TransactionsTable
        columns={columns}
        data={sortedTransactions}
        sorting={sorting}
        handleSorting={handleSorting}
      />
    </>
  );
};

export default TransactionsPage;
