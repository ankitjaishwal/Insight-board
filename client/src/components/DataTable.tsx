import type { Column } from "../types/table";
import { useEffect, useRef, useState } from "react";
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
  onReachEnd?: () => void;
  canLoadMore?: boolean;
  isLoadingMore?: boolean;
  bottomThreshold?: number;
};

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  sorting,
  onSort,
  getRowId,
  maxHeightClassName = "max-h-[calc(100vh-140px)]",
  rowActions,
  onReachEnd,
  canLoadMore = false,
  isLoadingMore = false,
  bottomThreshold = 300,
}: DataTableProps<T>) {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );
  const onReachEndRef = useRef(onReachEnd);

  useEffect(() => {
    onReachEndRef.current = onReachEnd;
  }, [onReachEnd]);

  useEffect(() => {
    if (!scrollElement || !onReachEndRef.current) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollElement;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (
        distanceToBottom < bottomThreshold &&
        canLoadMore &&
        !isLoadingMore
      ) {
        onReachEndRef.current?.();
      }
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [bottomThreshold, canLoadMore, isLoadingMore, scrollElement]);

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

        {isLoadingMore && data.length > 0 && (
          <tbody className="bg-white">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <tr
                key={`loading-row-${rowIndex}`}
                className="border-b border-gray-100"
                aria-hidden="true"
              >
                {columns.map((col) => (
                  <td
                    key={`loading-cell-${String(col.key)}-${rowIndex}`}
                    className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}
                  >
                    <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="ml-auto h-4 w-8 rounded bg-gray-200 animate-pulse" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}

export default DataTable;
