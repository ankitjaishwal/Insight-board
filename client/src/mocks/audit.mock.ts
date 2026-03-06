import type { AuditLog } from "../types/audit";

export const auditLogs: AuditLog[] = [
  {
    id: "1",
    action: "CREATE_TRANSACTION",
    entity: "TRANSACTION",
    entityId: "txn-1",
    userId: "user-1",
    userEmail: "ankit@example.com",
    before: null,
    after: { amount: 100 },
    createdAt: "2026-02-07T10:30:00Z",
  },
  {
    id: "2",
    action: "UPDATE_TRANSACTION",
    entity: "TRANSACTION",
    entityId: "txn-2",
    userId: "user-2",
    userEmail: "admin1@example.com",
    before: { status: "PENDING" },
    after: { status: "COMPLETED" },
    createdAt: "2026-02-07T11:00:00Z",
  },
];
