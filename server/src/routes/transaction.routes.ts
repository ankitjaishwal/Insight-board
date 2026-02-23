import { Router } from "express";
import { prisma } from "../db";
import { transactionQuerySchema } from "../validators/transactionQuery";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { validateCreate, validateUpdate } from "../utils/validateTransaction";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const parsed = transactionQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid query params",
        details: parsed.error.flatten(),
      });
    }

    const {
      search,
      status,
      from,
      to,
      min,
      max,
      page = 1,
      limit = 20,
      sort = "date",
      dir = "desc",
    } = parsed.data;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          transactionId: {
            contains: String(search),
          },
        },
        {
          userName: {
            contains: String(search),
          },
        },
      ];
    }

    if (status?.length) {
      where.status = {
        in: status,
      };
    }

    if (from || to) {
      where.date = {};

      if (from) where.date.gte = new Date(String(from));
      if (to) where.date.lte = new Date(String(to));
    }

    if (min || max) {
      where.amount = {};

      if (min) where.amount.gte = Number(min);
      if (max) where.amount.lte = Number(max);
    }

    const allowedSortFields = ["date", "amount", "transactionId", "userName"];

    const sortField = allowedSortFields.includes(String(sort))
      ? String(sort)
      : "date";

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Number(limit) || 20, 100);

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: [
          { [sortField]: dir === "asc" ? "asc" : "desc" },
          { id: "desc" },
        ],
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),

      prisma.transaction.count({ where }),
    ]);

    res.json({
      data,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch transactions",
    });
  }
});

router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "OPS"]),
  async (req: AuthRequest, res) => {
    try {
      const parsed = validateCreate(req.body);

      if (!parsed.ok) {
        return res.status(400).json({
          error: parsed.error.message,
          details: parsed.error.details,
        });
      }

      const { userName, amount, date, status } = parsed.data;
      const userId = req.user!.userId;

      const result = await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactionId: crypto.randomUUID(),
            userName,
            amount,
            date: new Date(date),
            status,
            userId,
          },
        });

        await tx.auditLog.create({
          data: {
            action: "CREATE_TRANSACTION",
            entity: "TRANSACTION",
            entityId: transaction.id,
            meta: JSON.stringify({ data: transaction }),
            userId,
          },
        });

        return transaction;
      });

      return res.status(201).json(result);
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to create transaction",
      });
    }
  },
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "OPS"]),
  async (req: AuthRequest, res) => {
    try {
      const parsed = validateUpdate(req.body);

      if (!parsed.ok) {
        return res.status(400).json({
          error: parsed.error.message,
          details: parsed.error.details,
        });
      }

      const userId = req.user!.userId;
      const id = String(req.params.id);

      const updated = await prisma.$transaction(async (tx) => {
        const before = await tx.transaction.findUnique({
          where: { id },
        });

        if (!before) {
          return null;
        }

        const updateData = {
          ...(parsed.data.userName !== undefined
            ? { userName: parsed.data.userName }
            : {}),
          ...(parsed.data.amount !== undefined
            ? { amount: parsed.data.amount }
            : {}),
          ...(parsed.data.status !== undefined
            ? { status: parsed.data.status }
            : {}),
          ...(parsed.data.date !== undefined
            ? { date: new Date(parsed.data.date) }
            : {}),
        };

        const after = await tx.transaction.update({
          where: { id },
          data: updateData,
        });

        await tx.auditLog.create({
          data: {
            action: "UPDATE_TRANSACTION",
            entity: "TRANSACTION",
            entityId: id,
            meta: JSON.stringify({ before, after }),
            userId,
          },
        });

        return after;
      });

      if (!updated) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      return res.json(updated);
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to update transaction",
      });
    }
  },
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);

      const deleted = await prisma.$transaction(async (tx) => {
        const snapshot = await tx.transaction.findUnique({
          where: { id },
        });

        if (!snapshot) {
          return null;
        }

        await tx.transaction.delete({
          where: { id },
        });

        await tx.auditLog.create({
          data: {
            action: "DELETE_TRANSACTION",
            entity: "TRANSACTION",
            entityId: id,
            meta: JSON.stringify({ snapshot }),
            userId,
          },
        });

        return true;
      });

      if (!deleted) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      return res.json({ message: "Transaction deleted successfully" });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        error: "Failed to delete transaction",
      });
    }
  },
);

export default router;
