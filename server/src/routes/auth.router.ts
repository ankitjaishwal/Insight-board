import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import { ApiError } from "../utils/apiError";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not set");
}

// routes...

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, "VALIDATION_ERROR", "Missing fields");
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ApiError(409, "CONFLICT", "User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "USER",
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "VALIDATION_ERROR", "Missing fields");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid credentials");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "NOT_FOUND", "User not found");
    }

    return res.json(user);
  } catch (err) {
    return next(err);
  }
});

export default router;
