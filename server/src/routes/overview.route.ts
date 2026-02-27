import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  try {
    const now = new Date();

    // Last 7 days start (midnight)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalTransactions,
      totalUsers,
      revenueAgg,
      statusBreakdown,
      averageAgg,
      last7DaysRaw,
      recentTransactions,
    ] = await Promise.all([
      prisma.transaction.count(),

      prisma.user.count(),

      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),

      prisma.transaction.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      prisma.transaction.aggregate({
        _avg: { amount: true },
      }),

      prisma.transaction.findMany({
        where: {
          date: { gte: sevenDaysAgo },
        },
        select: {
          date: true,
        },
      }),

      prisma.transaction.findMany({
        orderBy: { date: "desc" },
        take: 5,
        select: {
          id: true,
          userName: true,
          amount: true,
          status: true,
          date: true,
        },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.amount ?? 0;
    const averageTransactionValue = averageAgg._avg.amount ?? 0;

    // ---------- STATUS MAP ----------
    const statusMap: Record<string, number> = {
      COMPLETED: 0,
      PENDING: 0,
      FAILED: 0,
    };

    statusBreakdown.forEach((item) => {
      statusMap[item.status] = item._count.status;
    });

    const successRate =
      totalTransactions > 0
        ? (statusMap.COMPLETED / totalTransactions) * 100
        : 0;

    // ---------- LAST 7 DAYS TREND ----------
    const trendMap: Record<string, number> = {};

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);

      const key = d.toISOString().split("T")[0];
      trendMap[key] = 0;
    }

    last7DaysRaw.forEach((tx) => {
      const key = tx.date.toISOString().split("T")[0];
      if (trendMap[key] !== undefined) {
        trendMap[key]++;
      }
    });

    const last7DaysTransactions = Object.entries(trendMap).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    res.json({
      totalUsers,
      totalTransactions,
      totalRevenue,
      successRate: Number(successRate.toFixed(2)),

      failedCount: statusMap.FAILED,
      pendingCount: statusMap.PENDING,
      averageTransactionValue: Number(averageTransactionValue.toFixed(2)),

      statusBreakdown: statusMap,
      last7DaysTransactions,
      recentTransactions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch overview",
    });
  }
});

export default router;
