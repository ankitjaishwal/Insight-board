import type { Column } from "../types/table";

type Sorting<T> = {
  key: keyof T;
  direction: "asc" | "desc";
} | null;

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  sorting?: Sorting<T>;
  onSort?: (key: keyof T) => void;
  getRowId?: (row: T) => string;
  maxHeightClassName?: string;
};

function DataTable<T>({
  columns,
  data,
  sorting,
  onSort,
  getRowId,
  maxHeightClassName = "max-h-[calc(100vh-140px)]",
}: DataTableProps<T>) {
  return (
    <div
      className={`w-full border border-gray-200 rounded-md overflow-auto ${maxHeightClassName}`}
    >
      <table className="w-full border-collapse">
        {/* Header */}
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200 ${
                  column.align === "right" ? "text-right" : ""
                }`}
                style={{
                  cursor: column.sortable && onSort ? "pointer" : "default",
                }}
                onClick={() => {
                  if (column.sortable && onSort) {
                    onSort(column.key);
                  }
                }}
              >
                {column.header}

                {column.sortable &&
                  sorting?.key === column.key &&
                  (sorting.direction === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-sm text-gray-500 py-6 text-center"
              >
                No data found.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={getRowId ? getRowId(row) : index}
                className="border-b border-gray-100 hover:bg-gray-50 last:border-0"
              >
                {columns.map((col) => {
                  const value = row[col.key];

                  return (
                    <td
                      key={String(col.key)}
                      className={`px-4 py-3 text-sm text-gray-700 ${
                        col.align === "right" ? "text-right" : ""
                      }`}
                    >
                      {value
                        ? col.render
                          ? col.render(value, row)
                          : String(value)
                        : "-"}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
