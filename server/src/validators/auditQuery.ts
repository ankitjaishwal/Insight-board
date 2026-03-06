import { z } from "zod";

export const auditQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  from: z.string().optional(),
  to: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["createdAt"]).default("createdAt"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});
