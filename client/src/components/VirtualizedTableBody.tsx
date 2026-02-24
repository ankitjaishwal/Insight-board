import { observeElementRect, useVirtualizer } from "@tanstack/react-virtual";
import {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import type { Column } from "../types/table";

type VirtualizedTableBodyProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: Column<T>[];
  scrollElement: HTMLDivElement | null;
  getRowId?: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
  estimateRowHeight?: number;
};

type VirtualizedRowProps<T extends Record<string, unknown>> = {
  row: T;
  rowIndex: number;
  columns: Column<T>[];
  getRowId?: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
  measureElement?: (node: HTMLTableRowElement | null) => void;
};

function VirtualizedRowBase<T extends Record<string, unknown>>({
  row,
  rowIndex,
  columns,
  getRowId,
  rowActions,
  measureElement,
}: VirtualizedRowProps<T>) {
  return (
    <tr
      key={getRowId ? getRowId(row) : rowIndex}
      ref={measureElement}
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
            {value !== undefined && value !== null && value !== ""
              ? col.render
                ? col.render(value, row)
                : String(value)
              : "-"}
          </td>
        );
      })}

      {rowActions && (
        <td className="px-4 py-3 text-sm text-gray-700 text-right">
          {rowActions(row)}
        </td>
      )}
    </tr>
  );
}

const MemoizedVirtualizedRow = memo(
  VirtualizedRowBase,
  <T extends Record<string, unknown>>(
    prev: VirtualizedRowProps<T>,
    next: VirtualizedRowProps<T>,
  ) =>
    prev.row === next.row &&
    prev.rowIndex === next.rowIndex &&
    prev.columns === next.columns &&
    prev.getRowId === next.getRowId &&
    prev.rowActions === next.rowActions,
) as <T extends Record<string, unknown>>(
  props: VirtualizedRowProps<T>,
) => ReactNode;

function VirtualizedTableBody<T extends Record<string, unknown>>({
  data,
  columns,
  scrollElement,
  getRowId,
  rowActions,
  estimateRowHeight = 48,
}: VirtualizedTableBodyProps<T>) {
  const lastScrollOffsetRef = useRef(0);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimateRowHeight,
    observeElementRect,
    measureElement: (element) =>
      element?.getBoundingClientRect().height ?? estimateRowHeight,
    getItemKey: (index) => {
      const row = data[index];
      if (!row) return index;
      return getRowId ? getRowId(row) : index;
    },
    overscan: 8,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const topPadding = virtualRows[0]?.start ?? 0;
  const bottomPadding =
    rowVirtualizer.getTotalSize() -
    (virtualRows[virtualRows.length - 1]?.end ?? 0);
  const totalColumns = columns.length + (rowActions ? 1 : 0);

  useEffect(() => {
    if (!scrollElement) return;

    const handleScroll = () => {
      lastScrollOffsetRef.current = scrollElement.scrollTop;
    };

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
    };
  }, [scrollElement]);

  useLayoutEffect(() => {
    if (!scrollElement) return;

    rowVirtualizer.measure();

    const maxScrollTop = Math.max(
      0,
      scrollElement.scrollHeight - scrollElement.clientHeight,
    );
    const targetOffset = Math.min(lastScrollOffsetRef.current, maxScrollTop);

    if (scrollElement.scrollTop !== targetOffset) {
      scrollElement.scrollTop = targetOffset;
    }
  }, [data, rowVirtualizer, scrollElement]);

  if (virtualRows.length === 0) {
    return (
      <tbody className="bg-white">
        {data.map((row, index) => (
          <MemoizedVirtualizedRow
            key={getRowId ? getRowId(row) : index}
            row={row}
            rowIndex={index}
            columns={columns}
            getRowId={getRowId}
            rowActions={rowActions}
          />
        ))}
      </tbody>
    );
  }

  return (
    <tbody className="bg-white">
      {topPadding > 0 && (
        <tr aria-hidden="true">
          <td colSpan={totalColumns} style={{ height: `${topPadding}px` }} />
        </tr>
      )}

      {virtualRows.map((virtualRow) => {
        const row = data[virtualRow.index];

        if (!row) return null;

        return (
          <MemoizedVirtualizedRow
            key={getRowId ? getRowId(row) : virtualRow.index}
            row={row}
            rowIndex={virtualRow.index}
            columns={columns}
            getRowId={getRowId}
            rowActions={rowActions}
            measureElement={(node) => rowVirtualizer.measureElement(node)}
          />
        );
      })}

      {bottomPadding > 0 && (
        <tr aria-hidden="true">
          <td colSpan={totalColumns} style={{ height: `${bottomPadding}px` }} />
        </tr>
      )}
    </tbody>
  );
}

export default VirtualizedTableBody;
