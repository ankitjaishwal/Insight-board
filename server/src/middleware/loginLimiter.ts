import rateLimit from "express-rate-limit";
import { createRateLimitHandler } from "./rateLimitConfig";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many login attempts. Please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many login attempts. Please try again later."),
});
