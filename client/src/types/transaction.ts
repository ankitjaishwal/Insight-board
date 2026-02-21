export const Status = {
  Pending: "Pending",
  Completed: "Completed",
  Failed: "Failed",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export type Transaction = {
  transactionId: string;
  userName: string;
  status: Status;
  amount: number;
  date: string;
};
