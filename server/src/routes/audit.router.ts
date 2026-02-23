import { Router } from "express";
import { prisma } from "../db";
import { auditQuerySchema } from "../validators/auditQuery";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const parsed = auditQuerySchema.parse(req.query);

    const { search, action, from, to, page, limit, sort, dir } = parsed;

    const where: any = {};

    /* Search */
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { entityId: { contains: search } },
      ];
    }

    /* Action */
    if (action) {
      where.action = action;
    }

    /* Date */
    if (from || to) {
      where.createdAt = {};

      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: {
          [sort]: dir,
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
      }),

      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        error: "Invalid query params",
        details: err.flatten(),
      });
    }

    console.error(err);

    res.status(500).json({
      error: "Failed to fetch audit logs",
    });
  }
});

export default router;
