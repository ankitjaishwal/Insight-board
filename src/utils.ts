import type { Sorting } from "./types/table";
import { Status, type Transaction } from "./types/transaction";
import type { TransactionFilters } from "./types/transactionFilters";

export type Filters = {
  search: string;
  status: string;
};

export const deriveStatusBreakdown = (transactions: Transaction[]) => {
  const breakdown: Record<string, number> = {};

  transactions.forEach((tx) => {
    breakdown[tx.status] = (breakdown[tx.status] || 0) + 1;
  });

  return breakdown;
};

export const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const dayNum = date.getDate();
  const monthName = date.toLocaleString("en-US", { month: "short" });
  const yearNum = date.getFullYear();

  return `${dayNum} ${monthName} ${yearNum}`;
};

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

export function applyTransactionFilters(
  data: Transaction[],
  filters: Filters,
): Transaction[] {
  const search = (filters.search || "").trim();

  return data.filter((t) => {
    const matchesSearch =
      !search ||
      t.transactionId.includes(search) ||
      t.user.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filters.status === "All" || t.status === filters.status;

    return matchesSearch && matchesStatus;
  });
}

export const statusToParam: Record<Status, string> = {
  [Status.Completed]: "completed",
  [Status.Pending]: "pending",
  [Status.Failed]: "failed",
};

export const paramToStatus: Record<string, Status> = {
  completed: Status.Completed,
  pending: Status.Pending,
  failed: Status.Failed,
};

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a !== "object" || typeof b !== "object" || !a || !b) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

export type ValidationResult = {
  valid: boolean;
  errors: Partial<Record<keyof TransactionFilters, string>>;
};

/**
 * Central validator for transaction filters.
 * Pure function - no side effects.
 * Single source of truth for validation rules.
 */
export function validateFilters(filters: TransactionFilters): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  // Date validation
  if (filters.from && filters.to) {
    const from = new Date(filters.from);
    const to = new Date(filters.to);

    if (from > to) {
      errors.to = "To date must be after From date";
    }
  }

  // Amount validation
  if (
    filters.minAmount != null &&
    filters.maxAmount != null &&
    filters.minAmount > filters.maxAmount
  ) {
    errors.maxAmount = "Max must be ≥ Min";
  }

  // Negative amount validation
  if (filters.minAmount != null && filters.minAmount < 0) {
    errors.minAmount = "Amount cannot be negative";
  }

  if (filters.maxAmount != null && filters.maxAmount < 0) {
    errors.maxAmount = "Amount cannot be negative";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
