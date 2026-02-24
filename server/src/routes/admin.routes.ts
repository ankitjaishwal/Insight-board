import { Router } from "express";
import { prisma } from "../db";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { DEMO_EMAIL } from "../config/demo";

const router = Router();

const sampleStatuses = ["PENDING", "COMPLETED", "FAILED"] as const;

router.post("/reset-demo", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });

    if (!demoUser) {
      return res.status(404).json({ error: "Demo user not found" });
    }

    const now = Date.now();

    await prisma.$transaction(async (tx) => {
      await tx.filterPreset.deleteMany({
        where: { userId: demoUser.id },
      });
      await tx.auditLog.deleteMany();
      await tx.transaction.deleteMany();

      const createdTransactions = [] as Array<{
        id: string;
        transactionId: string;
      }>;

      for (let i = 1; i <= 100; i += 1) {
        const status = sampleStatuses[i % sampleStatuses.length];
        const transaction = await tx.transaction.create({
          data: {
            transactionId: `DEMO-TX-${1000 + i}`,
            userName: `Demo User ${((i - 1) % 5) + 1}`,
            status,
            amount: 50 + i * 25,
            date: new Date(now - i * 60 * 60 * 1000),
            userId: demoUser.id,
          },
        });

        createdTransactions.push({
          id: transaction.id,
          transactionId: transaction.transactionId,
        });
      }

      for (let i = 0; i < 10; i += 1) {
        const transaction = createdTransactions[i];

        await tx.auditLog.create({
          data: {
            action: "DEMO_RESET_SEEDED",
            entity: "TRANSACTION",
            entityId: transaction.id,
            meta: JSON.stringify({ transactionId: transaction.transactionId }),
            userId: demoUser.id,
          },
        });
      }

      await tx.filterPreset.createMany({
        data: [
          {
            id: crypto.randomUUID(),
            name: "Demo Pending",
            filters: JSON.stringify({ search: "", status: ["PENDING"] }),
            userId: demoUser.id,
            createdAt: new Date(now - 2000),
          },
          {
            id: crypto.randomUUID(),
            name: "Demo Completed",
            filters: JSON.stringify({ search: "", status: ["COMPLETED"] }),
            userId: demoUser.id,
            createdAt: new Date(now - 1000),
          },
        ],
      });
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to reset demo data" });
  }
});

export default router;
