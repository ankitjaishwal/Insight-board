import { z } from "zod";

const statusEnum = z.enum(["COMPLETED", "PENDING", "FAILED"]);

export const createTransactionSchema = z
  .object({
    userName: z.string().trim().min(2),
    amount: z.coerce.number().positive(),
    date: z.string().min(1),
    status: statusEnum,
  })
  .strict();

export const updateTransactionSchema = createTransactionSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const transactionQuerySchema = z
  .object({
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
          arr.every((status) =>
            ["COMPLETED", "PENDING", "FAILED"].includes(status),
          ),
        { message: "Invalid status value" },
      ),
    from: z.string().optional(),
    to: z.string().optional(),
    min: z.coerce.number().optional(),
    max: z.coerce.number().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    sort: z.string().optional(),
    dir: z.enum(["asc", "desc"]).optional(),
  })
  .strict();

export const transactionIdParamsSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
