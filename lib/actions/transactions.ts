"use server";

import { z } from "zod";

import type { ActionResult } from "@/lib/actions/result";
import { revalidateApp } from "@/lib/actions/revalidate";
import { parseDateOnly } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  createTransactionSchema,
  deleteTransactionSchema,
  updateTransactionSchema,
  type TransactionField,
  type TransactionInput,
} from "@/lib/validations/transaction";

type Result = ActionResult<TransactionField>;

function invalid(error: z.ZodError<Record<string, unknown>>): Result {
  return {
    ok: false,
    message: "Please fix the errors below.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

const INVALID_CATEGORY: Result = {
  ok: false,
  message: "Pick a category that matches the transaction type.",
  fieldErrors: { categoryId: ["Pick a category that matches the transaction type."] },
};

/** The category must belong to the user and have the same type as the transaction. */
async function isValidCategory(userId: string, categoryId: string, type: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { type: true },
  });
  return category?.type === type;
}

export async function createTransaction(input: TransactionInput): Promise<Result> {
  const user = await requireUser();
  const parsed = createTransactionSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { date, ...data } = parsed.data;
  if (!(await isValidCategory(user.id, data.categoryId, data.type))) {
    return INVALID_CATEGORY;
  }

  await prisma.transaction.create({
    data: { ...data, date: parseDateOnly(date), userId: user.id },
  });

  revalidateApp();
  return { ok: true, message: "Transaction added." };
}

export async function updateTransaction(
  input: TransactionInput & { id: string },
): Promise<Result> {
  const user = await requireUser();
  const parsed = updateTransactionSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { id, date, ...data } = parsed.data;
  if (!(await isValidCategory(user.id, data.categoryId, data.type))) {
    return INVALID_CATEGORY;
  }

  const { count } = await prisma.transaction.updateMany({
    where: { id, userId: user.id },
    data: { ...data, date: parseDateOnly(date) },
  });
  if (count === 0) return { ok: false, message: "Transaction not found." };

  revalidateApp();
  return { ok: true, message: "Transaction updated." };
}

export async function deleteTransaction(input: { id: string }): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = deleteTransactionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { count } = await prisma.transaction.deleteMany({
    where: { id: parsed.data.id, userId: user.id },
  });
  if (count === 0) return { ok: false, message: "Transaction not found." };

  revalidateApp();
  return { ok: true, message: "Transaction deleted." };
}
