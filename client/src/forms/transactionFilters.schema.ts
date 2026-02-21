import { z } from "zod";

export const transactionFiltersSchema = z
  .object({
    search: z.string().optional(),
    status: z.array(z.string()).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to) {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);

      if (fromDate > toDate) {
        ctx.addIssue({
          code: "custom",
          message: "From date must be before To date",
          path: ["from"],
        });

        ctx.addIssue({
          code: "custom",
          message: "From date must be before To date",
          path: ["to"],
        });
      }
    }
    if (
      data.minAmount !== undefined &&
      data.maxAmount !== undefined &&
      data.minAmount > data.maxAmount
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Min must be less than or equal to Max",
        path: ["minAmount"],
      });

      ctx.addIssue({
        code: "custom",
        message: "Min must be less than or equal to Max",
        path: ["maxAmount"],
      });
    }
  });
