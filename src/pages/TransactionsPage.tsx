import { useOutletContext, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import TransactionFilters from "../components/TransactionFilters";
import ActiveFiltersSummary from "../components/ActiveFiltersSummary";
import { transactions } from "../mocks/transactions.mock";
import type { Transaction } from "../types/transaction";
import { applySorting, formatDate } from "../utils";
import { validateFilters } from "../utils/validateFilters";
import { parseFilters } from "../filters/filters.parser";
import { applyFilters } from "../filters/filters.applier";
import type { RouteConfig } from "../config/app.config";
import type { TransactionFilters as TransactionFiltersType } from "../filters/filters.types";
import DataTable from "../components/DataTable";
import type { Column } from "../types/table";

const columns: Column<Transaction>[] = [
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

  const filters = parseFilters(searchParams);
  const validation = useMemo(() => validateFilters(filters), [filters]);
  
  const filteredTransactions = validation.valid
    ? applyFilters(transactions, filters)
    : transactions;

  const sortKey = searchParams.get("sort") as keyof Transaction | null;
  const direction = searchParams.get("dir") as "asc" | "desc" | null;
  const sorting = sortKey && direction ? { key: sortKey, direction } : null;

  const sortedTransactions = applySorting(filteredTransactions, sorting);

  const handleSorting = (key: keyof Transaction) => {
    setSearchParams((prev) => {
      const currentSort = prev.get("sort");
      const currentDir = prev.get("dir") as "asc" | "desc" | null;

      let newDir: "asc" | "desc" | null;

      if (currentSort !== key) {
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

  const handleRemoveFilter = (filterKey: keyof TransactionFiltersType) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (filterKey === "status") {
        next.delete("status");
      } else if (filterKey === "from") {
        next.delete("from");
      } else if (filterKey === "to") {
        next.delete("to");
      } else if (filterKey === "minAmount") {
        next.delete("min");
      } else if (filterKey === "maxAmount") {
        next.delete("max");
      } else if (filterKey === "search") {
        next.delete("search");
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

      <ActiveFiltersSummary
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
      />

      <TransactionFilters
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        validationErrors={validation.errors}
      />

      <DataTable<Transaction>
        columns={columns}
        data={sortedTransactions}
        sorting={sorting}
        onSort={handleSorting}
        getRowId={(row) => row.transactionId}
      />
    </>
  );
};

export default TransactionsPage;
