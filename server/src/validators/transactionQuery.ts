import { z } from "zod";

export const transactionQuerySchema = z.object({
  search: z.string().optional(),

  status: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;

      if (val.toUpperCase() === "ALL") return undefined;

      return val
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
    })
    .refine(
      (arr) =>
        !arr ||
        arr.every((s) => ["COMPLETED", "PENDING", "FAILED"].includes(s)),
      {
        message: "Invalid status value",
      },
    ),

  from: z.string().optional(),
  to: z.string().optional(),

  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),

  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),

  sort: z.string().optional(),
  dir: z.enum(["asc", "desc"]).optional(),
});
