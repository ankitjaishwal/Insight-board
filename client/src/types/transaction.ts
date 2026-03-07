export const Status = {
  Pending: "PENDING",
  Completed: "COMPLETED",
  Failed: "FAILED",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const statusLabel: Record<Status, string> = {
  [Status.Pending]: "Pending",
  [Status.Completed]: "Completed",
  [Status.Failed]: "Failed",
};

export type Transaction = {
  id?: string;
  transactionId: string;
  userName: string;
  status: Status;
  amount: number;
  date: string;
};
