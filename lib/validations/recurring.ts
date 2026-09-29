import { z } from "zod";

import { MAX_AMOUNT } from "@/lib/validations/transaction";

const date = z.iso
  .date("Pick a valid date")
  .refine((value) => value >= "2000-01-01" && value <= "2100-12-31", "Pick a valid date");

const recurringFields = {
  type: z.enum(["INCOME", "EXPENSE"], "Pick a type"),
  amount: z
    .number("Enter an amount")
    .int("Amount must be a whole number")
    .min(1, "Amount must be more than 0")
    .max(MAX_AMOUNT, "Amount is too large"),
  categoryId: z.string("Pick a category").min(1, "Pick a category"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"], "Pick a frequency"),
  startDate: date,
  endDate: z
    .union([date, z.literal(""), z.null()])
    .optional()
    .transform((value) => value || null),
  note: z
    .string()
    .trim()
    .max(200, "Note must be at most 200 characters")
    .optional()
    .transform((value) => value || null),
};

function endAfterStart(data: { startDate: string; endDate: string | null }) {
  return !data.endDate || data.endDate >= data.startDate;
}
const endDateError = { message: "End date must be on or after the start date", path: ["endDate"] };

export const createRecurringSchema = z.object(recurringFields).refine(endAfterStart, endDateError);

export const updateRecurringSchema = z
  .object({ id: z.string().min(1), ...recurringFields })
  .refine(endAfterStart, endDateError);

export const recurringIdSchema = z.object({ id: z.string().min(1) });

// Inputs from the client are untrusted; the schemas enforce the real rules.
export type RecurringInput = {
  type: string;
  amount: number | null;
  categoryId: string;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  note?: string;
};

export type RecurringField = keyof RecurringInput;
