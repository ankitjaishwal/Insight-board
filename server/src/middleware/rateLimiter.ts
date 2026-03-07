import rateLimit from "express-rate-limit";
import { createRateLimitHandler } from "./rateLimitConfig";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many requests"),
});
