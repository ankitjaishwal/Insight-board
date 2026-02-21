import type { Column } from "../types/table";

export function exportToCSV<T>(
  rows: T[],
  columns: Column<T>[],
  filename: string,
) {
  if (!rows.length) return;

  const headers = columns.map((c) => `"${c.header}"`).join(",");

  const body = rows.map((row) =>
    columns
      .map((c) => {
        const raw = row[c.key];

        if (raw === null || raw === undefined) return '""';

        const value = c.render ? String(c.render(raw, row)) : String(raw);

        return `"${value.replace(/"/g, '""')}"`;
      })
      .join(","),
  );

  const csv = [headers, ...body].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
