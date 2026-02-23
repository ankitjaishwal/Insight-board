import { z } from "zod";

const statusEnum = z.enum(["PENDING", "COMPLETED", "FAILED"]);

const createTransactionSchema = z
  .object({
    userName: z.string().trim().min(2).max(100),
    amount: z.number().gt(0),
    date: z.string().datetime(),
    status: statusEnum,
  })
  .strict();

const updateTransactionSchema = z
  .object({
    userName: z.string().trim().min(2).max(100).optional(),
    amount: z.number().gt(0).optional(),
    date: z.string().datetime().optional(),
    status: statusEnum.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

type ValidationSuccess<T> = {
  ok: true;
  data: T;
};

type ValidationFailure = {
  ok: false;
  error: {
    message: string;
    details: ReturnType<z.ZodError["flatten"]>;
  };
};

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export function validateCreate(input: unknown): ValidationResult<CreateTransactionInput> {
  const parsed = createTransactionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        message: "Invalid transaction payload",
        details: parsed.error.flatten(),
      },
    };
  }

  return { ok: true, data: parsed.data };
}

export function validateUpdate(input: unknown): ValidationResult<UpdateTransactionInput> {
  const parsed = updateTransactionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: {
        message: "Invalid transaction update payload",
        details: parsed.error.flatten(),
      },
    };
  }

  return { ok: true, data: parsed.data };
}
