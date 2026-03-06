import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "UNAUTHORIZED", "Missing token"));
  }

  const token = header.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, "UNAUTHORIZED", "Invalid token"));
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "Forbidden"));
    }

    next();
  };
}

export function requireAdmin(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return next(new ApiError(401, "UNAUTHORIZED", "Unauthorized"));
  }

  if (req.user.role !== "ADMIN") {
    return next(new ApiError(403, "FORBIDDEN", "Forbidden"));
  }

  next();
}
