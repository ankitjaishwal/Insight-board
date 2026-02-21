import { prisma } from "./db";

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

  console.log("Inserted:", tx);

  const all = await prisma.transaction.findMany();
  console.log("All:", all);
}

test();
