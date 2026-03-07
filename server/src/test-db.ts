import { prisma } from "./db";
import { logger } from "./utils/logger";

async function test() {
  const tx = await prisma.transaction.create({
    data: {
      transactionId: "tx-test",
      userName: "Alice",
      status: "Completed",
      amount: 100,
      date: new Date(),
    },
  });

  logger.info({ transaction: tx }, "Inserted transaction");

  const all = await prisma.transaction.findMany();
  logger.info({ transactions: all }, "Fetched transactions");
}

test();
