import { z } from "zod";

export const transactionQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["COMPLETED", "PENDING", "FAILED", "All"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sort: z.enum(["date", "amount", "transactionId", "userName"]).optional(),
  dir: z.enum(["asc", "desc"]).optional(),
});
