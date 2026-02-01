import { useOutletContext, useSearchParams } from "react-router-dom";
import TransactionsTable from "../components/TransactionsTable";
import { transactions } from "../mocks/transactions.mock";
import type { Transaction, TransactionColumn } from "../types";
import { applySorting, formatDate } from "../utils";
import { Status } from "../types/transaction";
import type { RouteConfig } from "../config/app.config";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status");
  const sortKey = searchParams.get("sort") as keyof Transaction | null;
  const direction = searchParams.get("dir") as "asc" | "desc" | null;

  const filteredTransactions =
    status === "completed"
      ? transactions.filter((t) => t.status === Status.Completed)
      : transactions;

  const sorting = sortKey && direction ? { key: sortKey, direction } : null;

  const sortedTransactions = applySorting(filteredTransactions, sorting);

  const handleSorting = (key: keyof Transaction) => {
    setSearchParams((prev) => {
      const currentSort = prev.get("sort");
      const currentDir = prev.get("dir") as "asc" | "desc" | null;

      let newDir: "asc" | "desc" | null;

      if (currentSort !== key) {
        // NEW COLUMN → start sorting
        newDir = "asc";
      } else if (currentDir === "asc") {
        newDir = "desc";
      } else if (currentDir === "desc") {
        newDir = null;
      } else {
        newDir = "asc";
      }

      const next = new URLSearchParams(prev);

      if (newDir) {
        next.set("sort", key);
        next.set("dir", newDir);
      } else {
        next.delete("sort");
        next.delete("dir");
      }

      return next;
    });
  };

  const { activeRoute } = useOutletContext<{ activeRoute: RouteConfig }>();

  return (
    <>
      <h1 className="text-xl text-gray-900 font-semibold pb-6">
        {activeRoute.label}
      </h1>
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
