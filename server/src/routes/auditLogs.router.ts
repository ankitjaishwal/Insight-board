import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import type { Prisma } from "@prisma/client";
import { validateRequest } from "../middleware/validateRequest";
import {
  auditQuerySchema,
  type AuditQueryInput,
} from "../schemas/auditSchemas";

const router = Router();

function parseJson(value: string | null): unknown | null {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

router.get(
  "/",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest({ query: auditQuerySchema }),
  async (req, res, next) => {
    try {
      const {
        page,
        limit,
        from,
        to,
        userId,
        user,
        action,
        entity,
        search,
        sort,
        dir,
      } = req.query as unknown as AuditQueryInput;
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);

      const conditions: Prisma.AuditLogWhereInput[] = [];

      if (from || to) {
        const createdAt: { gte?: Date; lte?: Date } = {};

        if (from) createdAt.gte = new Date(from);
        if (to) createdAt.lte = new Date(to);
        conditions.push({ createdAt });
      }

      const userFilter = userId || user;

      if (userFilter) {
        // `userId` filter is used as an investigator field: allow exact/partial id or email.
        conditions.push({
          OR: [
            { userId: { contains: userFilter } },
            { userEmail: { contains: userFilter } },
          ],
        });
      }

      if (action) conditions.push({ action });
      if (entity) conditions.push({ entity: entity.toUpperCase() });
      if (search) conditions.push({ entityId: { contains: search } });

      const where: Prisma.AuditLogWhereInput =
        conditions.length > 0 ? { AND: conditions } : {};

      const [rawData, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: [{ [sort]: dir }, { id: "desc" }],
          skip: (pageNumber - 1) * pageSize,
          take: pageSize,
        }),
        prisma.auditLog.count({ where }),
      ]);

      const data = rawData.map((row) => ({
        ...row,
        before: parseJson(row.before),
        after: parseJson(row.after),
      }));

      return res.json({
        data,
        meta: {
          total,
          page: pageNumber,
          limit: pageSize,
          pages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;
