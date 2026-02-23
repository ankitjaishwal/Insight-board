import { z } from "zod";

const statusEnum = z.enum(["PENDING", "COMPLETED", "FAILED"]);

export const createTransactionSchema = z.object({
  userName: z.string().trim().min(2, "User name must be at least 2 characters"),
  amount: z
    .number({ message: "Amount is required" })
    .positive("Amount must be greater than 0"),
  date: z.string().datetime({ message: "Date must be a valid ISO date-time" }),
  status: statusEnum,
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionFormValues = z.infer<typeof updateTransactionSchema>;
