import type { Sorting } from "../types/table";

export function applySorting<T extends Record<string, any>>(
  data: T[],
  sorting: Sorting<T>,
): T[] {
  if (!sorting) return data;

  const { key, direction } = sorting;

  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    // Date handling
    if (
      typeof aVal === "string" &&
      typeof bVal === "string" &&
      !isNaN(Date.parse(aVal)) &&
      !isNaN(Date.parse(bVal))
    ) {
      return direction === "asc"
        ? new Date(aVal).getTime() - new Date(bVal).getTime()
        : new Date(bVal).getTime() - new Date(aVal).getTime();
    }

    // Number handling
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    // Fallback string comparison
    return direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
}
