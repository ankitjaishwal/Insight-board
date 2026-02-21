import { type TransactionFilters } from "./transactionFilters";

export type FilterPreset = {
  id: string;
  name: string;
  filters: TransactionFilters;
  createdAt: number;
};
