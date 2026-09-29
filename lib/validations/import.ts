import { z } from "zod";

import { MAX_IMPORT_ROWS } from "@/lib/import/transaction-import";

const cell = z.string().max(1000);

export const importRowsSchema = z.object({
  rows: z
    .array(z.object({ date: cell, type: cell, category: cell, amount: cell, note: cell }))
    .min(1, "The file has no rows to import.")
    .max(MAX_IMPORT_ROWS, `Import at most ${MAX_IMPORT_ROWS} rows at a time.`),
  defaultType: z.enum(["INCOME", "EXPENSE"]),
});

export const importTransactionsSchema = importRowsSchema.extend({
  createCategories: z
    .array(z.object({ name: z.string().min(1).max(40), type: z.enum(["INCOME", "EXPENSE"]) }))
    .max(200),
  skipDuplicates: z.boolean(),
});

export type ImportRowsInput = z.input<typeof importRowsSchema>;
export type ImportTransactionsInput = z.input<typeof importTransactionsSchema>;
