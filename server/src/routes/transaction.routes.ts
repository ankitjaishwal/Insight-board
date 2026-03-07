import { Router } from "express";
import { prisma } from "../db";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/auth";
import { ApiError } from "../utils/apiError";
import { validateRequest } from "../middleware/validateRequest";
import {
  createTransactionSchema,
  transactionIdParamsSchema,
  transactionQuerySchema,
  updateTransactionSchema,
  type TransactionQueryInput,
} from "../schemas/transactionSchemas";

const router = Router();

router.get(
  "/",
  requireAuth,
  validateRequest({ query: transactionQuerySchema }),
  async (req, res, next) => {
  try {
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
    } = req.query as unknown as TransactionQueryInput;

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
    next(err);
  }
  },
);

router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "OPS"]),
  validateRequest({ body: createTransactionSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const { userName, amount, date, status } = req.body;
      const userId = req.user!.userId;
      const auditUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!auditUser) {
        throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
      }

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
            userId,
            userEmail: auditUser.email,
            before: null,
            after: JSON.stringify(transaction),
          },
        });

        return transaction;
      });

      return res.status(201).json(result);
    } catch (err) {
      return next(err);
    }
  },
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "OPS"]),
  validateRequest({
    params: transactionIdParamsSchema,
    body: updateTransactionSchema,
  }),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const auditUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!auditUser) {
        throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
      }

      const updated = await prisma.$transaction(async (tx) => {
        const before = await tx.transaction.findUnique({
          where: { id },
        });

        if (!before) {
          return null;
        }

        const updateData = {
          ...(req.body.userName !== undefined
            ? { userName: req.body.userName }
            : {}),
          ...(req.body.amount !== undefined
            ? { amount: req.body.amount }
            : {}),
          ...(req.body.status !== undefined
            ? { status: req.body.status }
            : {}),
          ...(req.body.date !== undefined
            ? { date: new Date(req.body.date) }
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
            userId,
            userEmail: auditUser.email,
            before: JSON.stringify(before),
            after: JSON.stringify(after),
          },
        });

        return after;
      });

      if (!updated) {
        throw new ApiError(404, "NOT_FOUND", "Transaction not found");
      }

      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  },
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest({ params: transactionIdParamsSchema }),
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.userId;
      const id = String(req.params.id);
      const auditUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!auditUser) {
        throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
      }

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
            userId,
            userEmail: auditUser.email,
            before: JSON.stringify(snapshot),
            after: null,
          },
        });

        return true;
      });

      if (!deleted) {
        throw new ApiError(404, "NOT_FOUND", "Transaction not found");
      }

      return res.json({ message: "Transaction deleted successfully" });
    } catch (err) {
      return next(err);
    }
  },
);

export default router;
