"use server";

import { z } from "zod";

import type { ActionResult } from "@/lib/actions/result";
import { revalidateApp } from "@/lib/actions/revalidate";
import { formatMonth, shiftMonth } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pluralize } from "@/lib/utils";
import {
  copyBudgetsSchema,
  deleteBudgetSchema,
  setBudgetSchema,
  type SetBudgetInput,
} from "@/lib/validations/budget";

const longMonth = (month: string) => formatMonth(month, { month: "long", year: "numeric" });

export async function setBudget(input: SetBudgetInput): Promise<ActionResult<"amount">> {
  const user = await requireUser();
  const parsed = setBudgetSchema.safeParse(input);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      message: fieldErrors.amount?.[0] ?? "Invalid budget.",
      fieldErrors: { amount: fieldErrors.amount },
    };
  }

  const { categoryId, month, amount } = parsed.data;
  // Budgets only make sense for the user's own expense categories.
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id, type: "EXPENSE" },
    select: { name: true },
  });
  if (!category) return { ok: false, message: "Category not found." };

  await prisma.budget.upsert({
    where: { userId_categoryId_month: { userId: user.id, categoryId, month } },
    create: { userId: user.id, categoryId, month, amount },
    update: { amount },
  });

  revalidateApp();
  return { ok: true, message: `Budget for ${category.name} saved.` };
}

export async function deleteBudget(input: {
  categoryId: string;
  month: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = deleteBudgetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { count } = await prisma.budget.deleteMany({
    where: { userId: user.id, ...parsed.data },
  });
  if (count === 0) return { ok: false, message: "Budget not found." };

  revalidateApp();
  return { ok: true, message: "Budget removed." };
}

/**
 * Copies the previous month's budgets into `month`. Categories that already
 * have a budget this month keep it; nothing is overwritten.
 */
export async function copyBudgetsFromPreviousMonth(input: {
  month: string;
}): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = copyBudgetsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid month." };

  const { month } = parsed.data;
  const previousMonth = shiftMonth(month, -1);
  const previous = await prisma.budget.findMany({
    where: { userId: user.id, month: previousMonth },
    select: { categoryId: true, amount: true },
  });
  if (previous.length === 0) {
    return { ok: false, message: `There are no budgets in ${longMonth(previousMonth)} to copy.` };
  }

  const { count } = await prisma.budget.createMany({
    data: previous.map((budget) => ({ ...budget, userId: user.id, month })),
    skipDuplicates: true,
  });
  if (count === 0) {
    return { ok: false, message: `Every budget from ${longMonth(previousMonth)} is already set.` };
  }

  revalidateApp();
  const skipped = previous.length - count;
  return {
    ok: true,
    message:
      `Copied ${pluralize(count, "budget")} from ${longMonth(previousMonth)}.` +
      (skipped > 0
        ? ` ${pluralize(skipped, "existing budget")} ${skipped === 1 ? "was" : "were"} kept.`
        : ""),
  };
}
