import type { TransactionFilters } from "../types/transactionFilters";

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
