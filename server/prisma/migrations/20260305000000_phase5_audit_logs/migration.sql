-- Rebuild AuditLog to match Phase 5 forensic schema.
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_AuditLog" (
  "id",
  "action",
  "entity",
  "entityId",
  "userId",
  "userEmail",
  "before",
  "after",
  "createdAt"
)
SELECT
  a."id",
  a."action",
  a."entity",
  COALESCE(a."entityId", ''),
  COALESCE(a."userId", 'system'),
  COALESCE(u."email", 'system@local'),
  NULL,
  a."meta",
  a."createdAt"
FROM "AuditLog" a
LEFT JOIN "User" u ON u."id" = a."userId";

DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";

CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
