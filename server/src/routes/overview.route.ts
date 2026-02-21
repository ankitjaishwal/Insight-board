import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [totalTransactions, totalUsers, revenueAgg, statusBreakdown] =
      await Promise.all([
        prisma.transaction.count(),
        prisma.user.count(),
        prisma.transaction.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: "COMPLETED",
          },
        }),
        prisma.transaction.groupBy({
          by: ["status"],
          _count: {
            status: true,
          },
        }),
      ]);

    const totalRevenue = revenueAgg._sum.amount || 0;

    // Convert to structured object
    const statusMap: Record<string, number> = {
      COMPLETED: 0,
      PENDING: 0,
      FAILED: 0,
    };

    statusBreakdown.forEach((item) => {
      statusMap[item.status] = item._count.status;
    });

    // Success rate
    const successRate =
      totalTransactions > 0
        ? (statusMap.COMPLETED / totalTransactions) * 100
        : 0;

    res.json({
      totalUsers,
      totalTransactions,
      totalRevenue,
      successRate: Number(successRate.toFixed(2)),
      statusBreakdown: statusMap,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to fetch overview",
    });
  }
});

export default router;
