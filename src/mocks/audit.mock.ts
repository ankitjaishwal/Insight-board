import type { AuditLog } from "../types/audit";

export const auditLogs: AuditLog[] = [
  {
    id: "1",
    actor: "ankit",
    role: "Finance",
    action: "VIEW_TRANSACTIONS",
    timestamp: "2026-02-07T10:30:00Z",
  },
  {
    id: "2",
    actor: "admin1",
    role: "Admin",
    action: "CHANGE_CONFIG",
    entity: "Dashboard",
    timestamp: "2026-02-07T11:00:00Z",
  },
];
