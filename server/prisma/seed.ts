import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_ROLE } from "../src/config/demo";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  /* -----------------------------
     CLEAN DATA
  ----------------------------- */

  await prisma.filterPreset.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.transaction.deleteMany();

  /* -----------------------------
     UPSERT USERS
  ----------------------------- */

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Admin",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
    },
  });

  const ops = await prisma.user.upsert({
    where: { email: "ops@test.com" },
    update: {},
    create: {
      email: "ops@test.com",
      name: "Ops User",
      passwordHash: defaultPasswordHash,
      role: "OPS",
    },
  });

  const finance = await prisma.user.upsert({
    where: { email: "finance@test.com" },
    update: {},
    create: {
      email: "finance@test.com",
      name: "Finance User",
      passwordHash: defaultPasswordHash,
      role: "FINANCE",
    },
  });

  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Demo Admin",
      passwordHash: demoPasswordHash,
      role: DEMO_ROLE,
    },
  });

  const users = [admin, ops, finance];

  /* -----------------------------
     TRANSACTIONS
  ----------------------------- */

  const statuses = ["COMPLETED", "PENDING", "FAILED"] as const;

  const transactionData = [];

  for (let i = 1; i <= 10000; i++) {
    const user = users[(i - 1) % users.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    transactionData.push({
      transactionId: `TX-${100000 + i}`,
      userName: user.name || "User",
      status,
      amount: Math.floor(Math.random() * 50000) + 100,
      date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30),
      userId: user.id,
    });
  }

  await prisma.transaction.createMany({
    data: transactionData,
  });

  const transactions = await prisma.transaction.findMany({
    select: { id: true },
    take: 500,
  });

  /* -----------------------------
     AUDIT LOGS
  ----------------------------- */

  const auditData = transactions.map((tx, i) => {
    const user = users[i % users.length];

    return {
      action: "VIEW_TRANSACTION",
      entity: "TRANSACTION",
      entityId: tx.id,
      userId: user.id,
      userEmail: user.email,
      before: null,
      after: JSON.stringify({
        ip: "127.0.0.1",
        browser: "Chrome",
      }),
    };
  });

  await prisma.auditLog.createMany({
    data: auditData,
  });

  console.log(`✅ Users ready: ${users.length + 1}`);
  console.log(`✅ Transactions created: ${transactionData.length}`);
  console.log(`✅ Audit logs created: ${auditData.length}`);
}

export async function runSeed() {
  try {
    await seed();
  } catch (e) {
    console.error("❌ Seed failed", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runSeed();
}
