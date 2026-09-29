"use server";

import { z } from "zod";

import type { ActionResult } from "@/lib/actions/result";
import { revalidateApp } from "@/lib/actions/revalidate";
import { Prisma, type TransactionType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pluralize } from "@/lib/utils";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type DeleteCategoryInput,
  type UpdateCategoryInput,
} from "@/lib/validations/category";

type CategoryField = "name" | "type" | "color" | "icon";

const DUPLICATE_NAME: ActionResult<CategoryField> = {
  ok: false,
  message: "A category with this name already exists.",
  fieldErrors: { name: ["You already have a category with this name for this type."] },
};

const NOT_FOUND: ActionResult = { ok: false, message: "Category not found." };

function invalid(error: z.ZodError<Record<string, unknown>>): ActionResult<CategoryField> {
  return {
    ok: false,
    message: "Please fix the errors below.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

/** Case-insensitive check, so "food" and "Food" can't both exist for one type. */
async function isNameTaken(
  userId: string,
  type: TransactionType,
  name: string,
  excludeId?: string,
) {
  const existing = await prisma.category.findFirst({
    where: {
      userId,
      type,
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  return existing !== null;
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<ActionResult<CategoryField>> {
  const user = await requireUser();
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const data = parsed.data;
  if (await isNameTaken(user.id, data.type, data.name)) return DUPLICATE_NAME;

  try {
    await prisma.category.create({ data: { ...data, userId: user.id } });
  } catch (error) {
    if (isUniqueViolation(error)) return DUPLICATE_NAME;
    throw error;
  }

  revalidateApp();
  return { ok: true, message: `Category "${data.name}" created.` };
}

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<ActionResult<CategoryField>> {
  const user = await requireUser();
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);

  const { id, ...data } = parsed.data;
  const category = await prisma.category.findFirst({
    where: { id, userId: user.id },
    select: { type: true },
  });
  if (!category) return NOT_FOUND;

  if (await isNameTaken(user.id, category.type, data.name, id)) {
    return DUPLICATE_NAME;
  }

  try {
    await prisma.category.update({ where: { id, userId: user.id }, data });
  } catch (error) {
    if (isUniqueViolation(error)) return DUPLICATE_NAME;
    throw error;
  }

  revalidateApp();
  return { ok: true, message: `Category "${data.name}" updated.` };
}

class ActionError extends Error {}

function describeUsage(transactionCount: number, recurringCount: number) {
  return [
    transactionCount > 0 && pluralize(transactionCount, "transaction"),
    recurringCount > 0 && pluralize(recurringCount, "recurring rule"),
  ]
    .filter(Boolean)
    .join(" and ");
}

/**
 * Deletes a category. If transactions or recurring rules still use it,
 * moveToId (another category of the same type) is required and they are
 * moved there first. Budgets of the deleted category are removed (cascade).
 */
export async function deleteCategory(
  input: DeleteCategoryInput,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = deleteCategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  const { id, moveToId } = parsed.data;
  if (moveToId === id) {
    return { ok: false, message: "Pick a different category to move to." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findFirst({
        where: { id, userId: user.id },
        select: { name: true, type: true },
      });
      if (!category) throw new ActionError(NOT_FOUND.message);

      const where = { userId: user.id, categoryId: id };
      const [transactionCount, recurringCount] = await Promise.all([
        tx.transaction.count({ where }),
        tx.recurringTransaction.count({ where }),
      ]);
      const inUse = transactionCount + recurringCount > 0;

      let target: { name: string } | null = null;
      if (inUse) {
        if (!moveToId) {
          throw new ActionError(
            "This category still has transactions. Move them to another category first.",
          );
        }
        target = await tx.category.findFirst({
          where: { id: moveToId, userId: user.id, type: category.type },
          select: { name: true },
        });
        if (!target) {
          throw new ActionError("Pick another category of the same type.");
        }
        const data = { categoryId: moveToId };
        await tx.transaction.updateMany({ where, data });
        await tx.recurringTransaction.updateMany({ where, data });
      }

      await tx.category.delete({ where: { id, userId: user.id } });
      return { name: category.name, target, transactionCount, recurringCount };
    });

    revalidateApp();
    return {
      ok: true,
      message: result.target
        ? `Moved ${describeUsage(result.transactionCount, result.recurringCount)} to "${result.target.name}" and deleted "${result.name}".`
        : `Category "${result.name}" deleted.`,
    };
  } catch (error) {
    if (error instanceof ActionError) return { ok: false, message: error.message };
    throw error;
  }
}
