import type { Transaction } from "../mocks/transactions.mock";

const TransactionsTable = ({
  columns,
  data,
}: {
  columns: { header: string; accessor: string; alignment?: string }[];
  data: Transaction[];
}) => {
  return (
    /* 1. Wrapper controls the scrolling */
    <div className="w-full border border-gray-200 rounded-md max-h-[calc(100vh-140px)] overflow-auto">
      <table className="w-full border-collapse">
        {/* 2. top-0 is required for sticky to work */}
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 ${
                  column.alignment === "right" ? "text-right" : ""
                }`}
              >
                {column.header}
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
            data.map((row, idx) => (
              <tr
                key={row.transactionId || idx}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer last:border-0"
              >
                {/* 3. Make the cells dynamic based on columns */}
                {columns.map((col) => (
                  <td
                    key={col.accessor}
                    className={`px-4 py-3 text-sm text-gray-700 ${
                      col.alignment === "right" ? "text-right" : ""
                    }`}
                  >
                    {row[col.accessor as keyof Transaction]}
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
