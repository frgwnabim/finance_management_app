"use server";

import { z } from "zod";

import type { ActionResult } from "@/lib/actions/result";
import { revalidateApp } from "@/lib/actions/revalidate";
import { parseDateOnly, toDateOnlyString, todayInAppTimeZone } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { generateRecurringTransactions } from "@/lib/recurring";
import { addDays } from "@/lib/recurring-schedule";
import { requireUser } from "@/lib/session";
import { pluralize } from "@/lib/utils";
import {
  createRecurringSchema,
  recurringIdSchema,
  updateRecurringSchema,
  type RecurringField,
  type RecurringInput,
} from "@/lib/validations/recurring";

type Result = ActionResult<RecurringField>;

function invalid(error: z.ZodError<Record<string, unknown>>): Result {
  return {
    ok: false,
    message: "Please fix the errors below.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

const INVALID_CATEGORY: Result = {
  ok: false,
  message: "Pick a category that matches the type.",
  fieldErrors: { categoryId: ["Pick a category that matches the type."] },
};

async function isValidCategory(userId: string, categoryId: string, type: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
    select: { type: true },
  });
  return category?.type === type;
}

/** Runs generation for the user and adds how many were created to the message. */
async function generateAndDescribe(userId: string, message: string) {
  const { created } = await generateRecurringTransactions({ userId });
  return created > 0 ? `${message} ${pluralize(created, "transaction")} added.` : message;
}

export async function createRecurring(input: RecurringInput): Promise<Result> {
  const user = await requireUser();
  const parsed = createRecurringSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { startDate, endDate, ...data } = parsed.data;
  if (!(await isValidCategory(user.id, data.categoryId, data.type))) return INVALID_CATEGORY;

  await prisma.recurringTransaction.create({
    data: {
      ...data,
      userId: user.id,
      startDate: parseDateOnly(startDate),
      endDate: endDate ? parseDateOnly(endDate) : null,
    },
  });

  // A start date in the past creates the occurrences that are already due.
  const message = await generateAndDescribe(user.id, "Recurring item created.");
  revalidateApp();
  return { ok: true, message };
}

/**
 * Changes apply to future occurrences only; transactions already created
 * keep their amount, note and date.
 */
export async function updateRecurring(input: RecurringInput & { id: string }): Promise<Result> {
  const user = await requireUser();
  const parsed = updateRecurringSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { id, startDate, endDate, ...data } = parsed.data;
  if (!(await isValidCategory(user.id, data.categoryId, data.type))) return INVALID_CATEGORY;

  const { count } = await prisma.recurringTransaction.updateMany({
    where: { id, userId: user.id },
    data: {
      ...data,
      startDate: parseDateOnly(startDate),
      endDate: endDate ? parseDateOnly(endDate) : null,
    },
  });
  if (count === 0) return { ok: false, message: "Recurring item not found." };

  const message = await generateAndDescribe(user.id, "Recurring item updated.");
  revalidateApp();
  return { ok: true, message };
}

/**
 * Pause or resume. Resuming doesn't backfill the paused period: generation
 * continues from today.
 */
export async function setRecurringActive(input: {
  id: string;
  isActive: boolean;
}): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = recurringIdSchema.extend({ isActive: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };
  const { id, isActive } = parsed.data;

  const item = await prisma.recurringTransaction.findFirst({
    where: { id, userId: user.id },
    select: { lastGeneratedDate: true, startDate: true },
  });
  if (!item) return { ok: false, message: "Recurring item not found." };

  let lastGeneratedDate = item.lastGeneratedDate;
  if (isActive) {
    const yesterday = addDays(todayInAppTimeZone(), -1);
    const last = lastGeneratedDate ? toDateOnlyString(lastGeneratedDate) : null;
    const start = toDateOnlyString(item.startDate);
    // Skip occurrences missed while paused (only relevant once started).
    if (start <= yesterday && (!last || last < yesterday)) {
      lastGeneratedDate = parseDateOnly(yesterday);
    }
  }

  await prisma.recurringTransaction.updateMany({
    where: { id, userId: user.id },
    data: { isActive, lastGeneratedDate },
  });

  const message = isActive
    ? await generateAndDescribe(user.id, "Recurring item resumed.")
    : "Recurring item paused.";
  revalidateApp();
  return { ok: true, message };
}

/** Transactions it already created are kept (their recurring link is cleared). */
export async function deleteRecurring(input: { id: string }): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = recurringIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { count } = await prisma.recurringTransaction.deleteMany({
    where: { id: parsed.data.id, userId: user.id },
  });
  if (count === 0) return { ok: false, message: "Recurring item not found." };

  revalidateApp();
  return { ok: true, message: "Recurring item deleted." };
}

/** Called once per browser session when the user opens the app. */
export async function runRecurringForCurrentUser(): Promise<{ created: number }> {
  const user = await requireUser();
  const { created } = await generateRecurringTransactions({ userId: user.id });
  if (created > 0) revalidateApp();
  return { created };
}
