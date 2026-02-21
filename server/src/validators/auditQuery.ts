import { z } from "zod";

export const auditQuerySchema = z.object({
  search: z.string().optional(),

  action: z.string().optional(),

  from: z.string().optional(),
  to: z.string().optional(),

  page: z.coerce.number().min(1).default(1),

  limit: z.coerce.number().min(1).max(100).default(20),

  sort: z.enum(["createdAt", "action"]).default("createdAt"),

  dir: z.enum(["asc", "desc"]).default("desc"),
});
