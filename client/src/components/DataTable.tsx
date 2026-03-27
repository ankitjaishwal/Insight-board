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
  expandedRowIds?: Set<string>;
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string | undefined;
  renderExpandedRow?: (row: T) => ReactNode;
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
  expandedRowIds,
  onRowClick,
  getRowClassName,
  renderExpandedRow,
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
      className={`w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${maxHeightClassName}`}
    >
      <table className="min-w-180 w-full border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm dark:bg-slate-900/95">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`border-b border-slate-200 px-3 py-3 text-left text-sm font-medium whitespace-nowrap text-slate-600 sm:px-4 dark:border-slate-700 dark:text-slate-300 ${
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
              <th className="border-b border-slate-200 px-3 py-3 text-right text-sm font-medium whitespace-nowrap text-slate-600 sm:px-4 dark:border-slate-700 dark:text-slate-300">
                Actions
              </th>
            )}
          </tr>
        </thead>

        {data.length === 0 ? (
          <tbody className="bg-white dark:bg-slate-900">
            <tr>
              <td
                colSpan={columns.length + (rowActions ? 1 : 0)}
                className="py-6 text-center text-sm text-slate-500 dark:text-slate-400"
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
            expandedRowIds={expandedRowIds}
            onRowClick={onRowClick}
            getRowClassName={getRowClassName}
            renderExpandedRow={renderExpandedRow}
          />
        )}

        {isLoadingMore && data.length > 0 && (
          <tbody className="bg-white dark:bg-slate-900">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <tr
                key={`loading-row-${rowIndex}`}
                className="border-b border-slate-100 dark:border-slate-800"
                aria-hidden="true"
              >
                {columns.map((col) => (
                  <td
                    key={`loading-cell-${String(col.key)}-${rowIndex}`}
                    className={`px-3 py-3 sm:px-4 ${col.align === "right" ? "text-right" : ""}`}
                  >
                    <div className="ui-skeleton h-4 w-full" />
                  </td>
                ))}
                {rowActions && (
                  <td className="px-3 py-3 text-right sm:px-4">
                    <div className="ui-skeleton ml-auto h-4 w-8" />
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
