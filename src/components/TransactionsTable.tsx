import type { Transaction, TransactionColumn } from "../types";

const TransactionsTable = ({
  columns,
  data,
  sorting,
  handleSorting,
}: {
  columns: TransactionColumn[];
  data: Transaction[];
  sorting: { key: keyof Transaction; direction: "asc" | "desc" } | null;
  handleSorting: (key: keyof Transaction) => void;
}) => {
  return (
    <div className="w-full border border-gray-200 rounded-md max-h-[calc(100vh-140px)] overflow-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200 ${
                  column.align === "right" ? "text-right" : ""
                }`}
                style={{ cursor: column.sortable ? "pointer" : "default" }}
                onClick={() => handleSorting(column.key as keyof Transaction)}
              >
                {column.header}
                {column.sortable && sorting?.key === column.key
                  ? sorting.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                className="text-sm text-gray-500 py-6 text-center"
                colSpan={columns.length}
              >
                No transactions found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.transactionId}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer last:border-0"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-gray-700 ${
                      col.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {col.render
                      ? col.render(row[col.key as keyof Transaction])
                      : row[col.key as keyof Transaction]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
