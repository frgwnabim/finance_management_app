import { z } from "zod";

/** Postgres INTEGER upper bound (amount column). */
export const MAX_AMOUNT = 2_147_483_647;

const transactionFields = {
  type: z.enum(["INCOME", "EXPENSE"], "Pick a type"),
  amount: z
    .number("Enter an amount")
    .int("Amount must be a whole number")
    .min(1, "Amount must be more than 0")
    .max(MAX_AMOUNT, "Amount is too large"),
  categoryId: z.string("Pick a category").min(1, "Pick a category"),
  date: z.iso
    .date("Pick a valid date")
    .refine((value) => value >= "2000-01-01" && value <= "2100-12-31", "Pick a valid date"),
  note: z
    .string()
    .trim()
    .max(200, "Note must be at most 200 characters")
    .optional()
    .transform((value) => value || null),
};

export const createTransactionSchema = z.object(transactionFields);

export const updateTransactionSchema = z.object({
  id: z.string().min(1),
  ...transactionFields,
});

export const deleteTransactionSchema = z.object({ id: z.string().min(1) });

// Inputs from the client are untrusted; the schemas enforce the real rules.
export type TransactionInput = {
  type: string;
  amount: number | null;
  categoryId: string;
  date: string;
  note?: string;
};

export type TransactionField = keyof TransactionInput;
