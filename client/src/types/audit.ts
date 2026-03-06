export type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userEmail: string;
  before: unknown | null;
  after: unknown | null;
  createdAt: string;
};
