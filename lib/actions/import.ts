"use server";

import { revalidateApp } from "@/lib/actions/revalidate";
import { CATEGORY_COLOR_VALUES } from "@/lib/categories";
import { parseDateOnly, toDateOnlyString } from "@/lib/dates";
import type { TransactionType } from "@/lib/generated/prisma/client";
import {
  duplicateKey,
  normalizeImportRow,
  type RawImportRow,
} from "@/lib/import/transaction-import";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  importRowsSchema,
  importTransactionsSchema,
  type ImportRowsInput,
  type ImportTransactionsInput,
} from "@/lib/validations/import";

export type PreviewRow = {
  /** Line number in the CSV file (the header is line 1). */
  line: number;
  date: string | null;
  type: TransactionType | null;
  category: string;
  amount: number | null;
  note: string | null;
  errors: string[];
  /** "existing": matches a saved transaction; "file": repeats an earlier row. */
  duplicate: "existing" | "file" | null;
  /** The category doesn't exist yet for this type. */
  isNewCategory: boolean;
};

export type NewCategory = { name: string; type: TransactionType; rows: number };

export type ImportPreview =
  | { ok: true; rows: PreviewRow[]; newCategories: NewCategory[] }
  | { ok: false; message: string };

const categoryKey = (type: string, name: string) =>
  `${type}|${name.toLowerCase()}`;

/**
 * Parses and validates every row, matches categories (case-insensitive,
 * per type) and flags possible duplicates. Shared by preview and import so
 * both always agree; the browser's view is never trusted.
 */
async function analyzeRows(
  userId: string,
  rawRows: RawImportRow[],
  defaultType: TransactionType,
) {
  const categories = await prisma.category.findMany({
    where: { userId },
    select: { id: true, name: true, type: true },
  });
  const categoryIdByKey = new Map(
    categories.map((c) => [categoryKey(c.type, c.name), c.id]),
  );

  const parsed = rawRows.map((raw) => normalizeImportRow(raw, defaultType));

  // Existing transactions that could match: same user, within the file's date range.
  const dates = parsed.flatMap((row) =>
    row.date && row.amount ? [row.date] : [],
  );
  const existingKeys = new Set<string>();
  if (dates.length > 0) {
    const sorted = [...dates].sort();
    const existing = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: parseDateOnly(sorted[0]),
          lte: parseDateOnly(sorted[sorted.length - 1]),
        },
      },
      select: { date: true, amount: true, note: true },
    });
    for (const transaction of existing) {
      existingKeys.add(
        duplicateKey(
          toDateOnlyString(transaction.date),
          transaction.amount,
          transaction.note,
        ),
      );
    }
  }

  const seenInFile = new Set<string>();
  const newCategories = new Map<string, NewCategory>();

  const rows: PreviewRow[] = parsed.map((row, index) => {
    let duplicate: PreviewRow["duplicate"] = null;
    let isNewCategory = false;

    if (row.errors.length === 0 && row.date && row.amount && row.type) {
      const key = duplicateKey(row.date, row.amount, row.note);
      if (existingKeys.has(key)) duplicate = "existing";
      else if (seenInFile.has(key)) duplicate = "file";
      seenInFile.add(key);

      const catKey = categoryKey(row.type, row.category);
      if (!categoryIdByKey.has(catKey)) {
        isNewCategory = true;
        const entry = newCategories.get(catKey);
        if (entry) entry.rows++;
        else
          newCategories.set(catKey, {
            name: row.category,
            type: row.type,
            rows: 1,
          });
      }
    }

    return { line: index + 2, ...row, duplicate, isNewCategory };
  });

  return { rows, newCategories: [...newCategories.values()], categoryIdByKey };
}

export async function previewImport(
  input: ImportRowsInput,
): Promise<ImportPreview> {
  const user = await requireUser();
  const parsed = importRowsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid file.",
    };
  }
  const { rows, newCategories } = await analyzeRows(
    user.id,
    parsed.data.rows,
    parsed.data.defaultType,
  );
  return { ok: true, rows, newCategories };
}

export type ImportResult =
  | {
      ok: true;
      imported: number;
      skipped: { invalid: number; duplicates: number; missingCategory: number };
      categoriesCreated: number;
    }
  | { ok: false; message: string };

function colorFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return CATEGORY_COLOR_VALUES[hash % CATEGORY_COLOR_VALUES.length];
}

/**
 * Imports only valid rows, creating the approved new categories, all in a
 * single database transaction: either everything is saved or nothing is.
 */
export async function importTransactions(
  input: ImportTransactionsInput,
): Promise<ImportResult> {
  const user = await requireUser();
  const parsed = importTransactionsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid import.",
    };
  }
  const {
    rows: rawRows,
    defaultType,
    createCategories,
    skipDuplicates,
  } = parsed.data;
  const { rows, newCategories, categoryIdByKey } = await analyzeRows(
    user.id,
    rawRows,
    defaultType,
  );

  // Only create categories that are actually new and were approved.
  const approved = new Set(
    createCategories.map((c) => categoryKey(c.type, c.name)),
  );
  const toCreate = newCategories.filter((c) =>
    approved.has(categoryKey(c.type, c.name)),
  );
  const creatable = new Set(toCreate.map((c) => categoryKey(c.type, c.name)));

  const skipped = { invalid: 0, duplicates: 0, missingCategory: 0 };
  const valid: PreviewRow[] = [];
  const usedNewKeys = new Set<string>();
  for (const row of rows) {
    const key = row.type ? categoryKey(row.type, row.category) : "";
    if (row.errors.length > 0) {
      skipped.invalid++;
    } else if (skipDuplicates && row.duplicate) {
      skipped.duplicates++;
    } else if (row.isNewCategory && !creatable.has(key)) {
      skipped.missingCategory++;
    } else {
      valid.push(row);
      if (row.isNewCategory) usedNewKeys.add(key);
    }
  }
  if (valid.length === 0) {
    return { ok: false, message: "There are no valid rows to import." };
  }

  let outcome: { imported: number; categoriesCreated: number };
  try {
    outcome = await prisma.$transaction(
      async (tx) => {
        const ids = new Map(categoryIdByKey);
        // Only create categories that at least one imported row uses.
        const usedNew = toCreate.filter((c) =>
          usedNewKeys.has(categoryKey(c.type, c.name)),
        );
        for (const category of usedNew) {
          const created = await tx.category.create({
            data: {
              userId: user.id,
              name: category.name,
              type: category.type,
              color: colorFor(category.name),
              icon: "ellipsis",
            },
            select: { id: true },
          });
          ids.set(categoryKey(category.type, category.name), created.id);
        }

        const result = await tx.transaction.createMany({
          data: valid.map((row) => ({
            userId: user.id,
            categoryId: ids.get(categoryKey(row.type!, row.category))!,
            type: row.type!,
            amount: row.amount!,
            date: parseDateOnly(row.date!),
            note: row.note,
          })),
        });
        return { imported: result.count, categoriesCreated: usedNew.length };
      },
      { timeout: 30_000 },
    );
  } catch (error) {
    // The transaction rolled back: no categories or transactions were saved.
    console.error("CSV import failed", error);
    return {
      ok: false,
      message: "Import failed. Nothing was saved, please try again.",
    };
  }

  revalidateApp();
  return { ok: true, skipped, ...outcome };
}
