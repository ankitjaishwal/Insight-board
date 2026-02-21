import type { TransactionFilters } from "../types/transactionFilters";

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

/**
 * Central validator for transaction filters.
 * Pure function - no side effects.
 * Returns structured validation result.
 */
export function validateFilters(filters: TransactionFilters): ValidationResult {
  const errors: Record<string, string> = {};

  // Date validation
  if (filters.from && filters.to && filters.from > filters.to) {
    errors.dateRange = "From date must be before To date";
  }

  // Amount validation
  if (
    filters.minAmount !== undefined &&
    filters.maxAmount !== undefined &&
    filters.minAmount > filters.maxAmount
  ) {
    errors.amountRange = "Minimum amount must be less than maximum";
  }

  if (filters.minAmount !== undefined && filters.minAmount < 0) {
    errors.amountRange = "Minimum amount cannot be negative";
  }

  if (filters.maxAmount !== undefined && filters.maxAmount < 0) {
    errors.amountRange = "Maximum amount cannot be negative";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
