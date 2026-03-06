-- Normalize legacy AuditLog entity values to uppercase for consistent filtering.
UPDATE "AuditLog"
SET "entity" = UPPER("entity")
WHERE "entity" IS NOT NULL;
