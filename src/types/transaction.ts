import type { ReactNode } from "react";

export type Transaction = {
  transactionId: string;
  user: string;
  status: string;
  amount: number;
  date: string;
};

export type TransactionColumn = {
  key: string;
  header: string;
  align?: "left" | "right";
  render?: (value: string | number) => ReactNode;
};
