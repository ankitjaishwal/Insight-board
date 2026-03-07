import { Request, Response, NextFunction } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { ApiError } from "../utils/apiError";

type RequestSchema = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

function setValidatedRequestValue<K extends "body" | "query" | "params">(
  req: Request,
  key: K,
  value: Request[K],
) {
  Object.defineProperty(req, key, {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
}

export function validateRequest(schema: RequestSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        setValidatedRequestValue(req, "body", schema.body.parse(req.body));
      }

      if (schema.query) {
        setValidatedRequestValue(
          req,
          "query",
          schema.query.parse(req.query) as Request["query"],
        );
      }

      if (schema.params) {
        setValidatedRequestValue(
          req,
          "params",
          schema.params.parse(req.params) as Request["params"],
        );
      }

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new ApiError(
            400,
            "VALIDATION_ERROR",
            "Invalid request data",
            err.flatten(),
          ),
        );
      }

      return next(err);
    }
  };
}
