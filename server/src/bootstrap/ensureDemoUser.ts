import bcrypt from "bcrypt";
import { prisma } from "../db";
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_ROLE } from "../config/demo";

export async function ensureDemoUser() {
  const existingDemoUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: {
      id: true,
      name: true,
      passwordHash: true,
      role: true,
    },
  });

  if (!existingDemoUser) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        name: "Demo Admin",
        passwordHash,
        role: DEMO_ROLE,
      },
    });

    return;
  }

  const updates: {
    name?: string;
    passwordHash?: string;
    role?: string;
  } = {};

  if (existingDemoUser.name !== "Demo Admin") {
    updates.name = "Demo Admin";
  }

  if (!existingDemoUser.passwordHash) {
    updates.passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  }

  if (existingDemoUser.role !== DEMO_ROLE) {
    updates.role = DEMO_ROLE;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { id: existingDemoUser.id },
      data: updates,
    });
  }
}
