import bcrypt from "bcrypt";
import { prisma } from "../db";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_ROLE } from "../config/demo";

export async function ensureDemoUser() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      name: "Demo Admin",
      passwordHash,
      role: DEMO_ROLE,
    },
    update: {
      name: "Demo Admin",
      passwordHash,
      role: DEMO_ROLE,
    },
  });
}
