export type AuditAction =
  | "LOGIN"
  | "VIEW_TRANSACTIONS"
  | "EXPORT_DATA"
  | "CHANGE_CONFIG"
  | "FILTER_APPLIED";

export type AuditLog = {
  id: string;
  actor: string;
  role: string;
  action: AuditAction;
  entity?: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

export type AuditColumn = {
  key: keyof AuditLog;
  header: string;
  sortable?: boolean;
};
