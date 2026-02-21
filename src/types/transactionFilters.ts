export type TransactionFilters = {
  search?: string;
  status?: string[];
  from?: string;
  to?: string;
  minAmount?: number;
  maxAmount?: number;
};
