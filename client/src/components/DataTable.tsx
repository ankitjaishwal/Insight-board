import type { Column } from "../types/table";
import { useState } from "react";
import type { ReactNode } from "react";
import VirtualizedTableBody from "./VirtualizedTableBody";

type Sorting<T> = {
  key: keyof T;
  direction: "asc" | "desc";
} | null;

type DataTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  sorting?: Sorting<T>;
  onSort?: (key: keyof T) => void;
  getRowId?: (row: T) => string;
  maxHeightClassName?: string;
  rowActions?: (row: T) => ReactNode;
};

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  sorting,
  onSort,
  getRowId,
  maxHeightClassName = "max-h-[calc(100vh-140px)]",
  rowActions,
}: DataTableProps<T>) {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <div
      ref={setScrollElement}
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
                } ${
                  column.sortable && onSort
                    ? "cursor-pointer"
                    : "cursor-default"
                }`}
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
            {rowActions && (
              <th className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-200 text-right">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {data.length === 0 ? (
          <tbody className="bg-white">
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="text-sm text-gray-500 py-6 text-center"
              >
                No data found.
              </td>
            </tr>
          </tbody>
        ) : (
          <VirtualizedTableBody
            data={data}
            columns={columns}
            scrollElement={scrollElement}
            getRowId={getRowId}
            rowActions={rowActions}
          />
        )}
      </table>
    </div>
  );
}

export default DataTable;
