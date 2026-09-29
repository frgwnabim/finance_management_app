import { z } from "zod";

import { isMonthKey } from "@/lib/budgets";
import { MAX_AMOUNT } from "@/lib/validations/transaction";

const month = z.string().refine(isMonthKey, "Invalid month");

export const setBudgetSchema = z.object({
  categoryId: z.string().min(1, "Pick a category"),
  month,
  amount: z
    .number("Enter an amount")
    .int("Amount must be a whole number")
    .min(1, "Budget must be more than 0")
    .max(MAX_AMOUNT, "Amount is too large"),
});

export const deleteBudgetSchema = z.object({
  categoryId: z.string().min(1),
  month,
});

export const copyBudgetsSchema = z.object({ month });

// Inputs from the client are untrusted; the schemas enforce the real rules.
export type SetBudgetInput = { categoryId: string; month: string; amount: number | null };
