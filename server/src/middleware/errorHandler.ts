import type { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
  });
};
