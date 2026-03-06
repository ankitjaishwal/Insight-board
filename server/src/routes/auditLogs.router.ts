import { Router } from "express";
import { prisma } from "../db";
import { auditQuerySchema } from "../validators/auditQuery";
import { requireAuth, requireRole } from "../middleware/auth";
import type { Prisma } from "@prisma/client";
import { ApiError } from "../utils/apiError";

const router = Router();

function parseJson(value: string | null): unknown | null {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

router.get("/", requireAuth, requireRole(["ADMIN"]), async (req, res, next) => {
  try {
    const parsed = auditQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid query params",
        parsed.error.flatten(),
      );
    }

    const {
      page,
      limit,
      from,
      to,
      userId,
      action,
      entity,
      search,
      sort,
      dir,
    } = parsed.data;

    const conditions: Prisma.AuditLogWhereInput[] = [];

    if (from || to) {
      const createdAt: { gte?: Date; lte?: Date } = {};

      if (from) createdAt.gte = new Date(from);
      if (to) createdAt.lte = new Date(to);
      conditions.push({ createdAt });
    }

    if (userId) {
      // `userId` filter is used as an investigator field: allow exact/partial id or email.
      conditions.push({
        OR: [{ userId: { contains: userId } }, { userEmail: { contains: userId } }],
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
        skip: (page - 1) * limit,
        take: limit,
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
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
