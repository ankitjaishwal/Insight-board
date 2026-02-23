import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_ROLE } from "../src/config/demo";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Clear existing data
  await prisma.filterPreset.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      name: "Admin",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
    },
  });

  const ops = await prisma.user.create({
    data: {
      email: "ops@test.com",
      name: "Ops User",
      passwordHash: defaultPasswordHash,
      role: "OPS",
    },
  });

  const finance = await prisma.user.create({
    data: {
      email: "finance@test.com",
      name: "Finance User",
      passwordHash: defaultPasswordHash,
      role: "FINANCE",
    },
  });

  await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo Admin",
      passwordHash: demoPasswordHash,
      role: DEMO_ROLE,
    },
  });

  const users = [admin, ops, finance];

  // Status pool
  const statuses = ["COMPLETED", "PENDING", "FAILED"] as const;

  // Create transactions
  const transactions = [];

  for (let i = 1; i <= 120; i++) {
    const user = users[i % users.length];
    const status = statuses[i % statuses.length];

    const tx = await prisma.transaction.create({
      data: {
        transactionId: `TX-${1000 + i}`,
        userName: user.name || "User",
        status,
        amount: Math.floor(Math.random() * 9000) + 100,
        date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30), // last 30 days
        user: {
          connect: { id: user.id },
        },
      },
    });

    transactions.push(tx);
  }

  // Create audit logs
  for (let i = 0; i < 50; i++) {
    const user = users[i % users.length];

    await prisma.auditLog.create({
      data: {
        action: "VIEW_TRANSACTION",
        entity: "Transaction",
        entityId: transactions[i].id,
        meta: JSON.stringify({
          ip: "127.0.0.1",
          browser: "Chrome",
        }),
        userId: user.id,
      },
    });
  }

  console.log("✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
