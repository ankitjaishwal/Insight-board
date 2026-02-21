import { Router } from "express";
import { prisma } from "../db";
import { transactionQuerySchema } from "../validators/transactionQuery";

const router = Router();

router.get("/", async (req, res) => {
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

export default router;
