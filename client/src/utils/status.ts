import { Status } from "../types/transaction";

export const statusToParam: Record<Status, string> = {
  [Status.Completed]: "completed",
  [Status.Pending]: "pending",
  [Status.Failed]: "failed",
};

export const paramToStatus: Record<string, Status> = {
  completed: Status.Completed,
  pending: Status.Pending,
  failed: Status.Failed,
};
