import type { ReactNode } from "react";

export const Status = {
  Pending: "Pending",
  Completed: "Completed",
  Failed: "Failed",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export type Transaction = {
  transactionId: string;
  user: string;
  status: Status;
  amount: number;
  date: string;
};

export type TransactionColumn = {
  key: string;
  header: string;
  align?: "left" | "right";
  render?: (value: string | number) => ReactNode;
  sortable?: boolean;
};
