import type { TransactionFilters } from "../types/transactionFilters";
import { transactionFiltersSchema } from "../forms/transactionFilters.schema";

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
  const parsed = transactionFiltersSchema.safeParse(filters);
  const errors: ValidationResult["errors"] = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string" && !errors[path as keyof TransactionFilters]) {
        errors[path as keyof TransactionFilters] = issue.message;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
