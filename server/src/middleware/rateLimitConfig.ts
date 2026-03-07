import type { Request, Response } from "express";
import type { Options } from "express-rate-limit";

type RateLimitResponse = {
  error: {
    code: "RATE_LIMITED";
    message: string;
  };
};

const buildRateLimitResponse = (message: string): RateLimitResponse => ({
  error: {
    code: "RATE_LIMITED",
    message,
  },
});

export const createRateLimitHandler =
  (message: string): Options["handler"] =>
  (_req: Request, res: Response) => {
    res.status(429).json(buildRateLimitResponse(message));
  };
