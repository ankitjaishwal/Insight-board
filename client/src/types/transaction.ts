export const Status = {
  Pending: "Pending",
  Completed: "Completed",
  Failed: "Failed",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export type Transaction = {
  id?: string;
  transactionId: string;
  userName: string;
  status: Status;
  amount: number;
  date: string;
};
