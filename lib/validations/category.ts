import { z } from "zod";

import { CATEGORY_COLOR_VALUES, CATEGORY_ICONS } from "@/lib/categories";

const id = z.string().min(1, "Invalid category");

const categoryFields = {
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(40, "Name must be at most 40 characters"),
  color: z.enum(CATEGORY_COLOR_VALUES, "Pick a color"),
  icon: z.enum(CATEGORY_ICONS, "Pick an icon"),
};

export const createCategorySchema = z.object({
  ...categoryFields,
  type: z.enum(["INCOME", "EXPENSE"], "Pick a type"),
});

// Type can't change after creation: existing transactions share the category's type.
export const updateCategorySchema = z.object({
  id,
  ...categoryFields,
});

export const deleteCategorySchema = z.object({
  id,
  // Required when the category is still used by transactions or recurring rules.
  moveToId: id.optional(),
});

// Action inputs arrive from the client untrusted, so they are typed as plain
// strings; the schemas above enforce the allowed values.
type Untrusted<T> = { [K in keyof T]: undefined extends T[K] ? string | undefined : string };

export type CreateCategoryInput = Untrusted<z.input<typeof createCategorySchema>>;
export type UpdateCategoryInput = Untrusted<z.input<typeof updateCategorySchema>>;
export type DeleteCategoryInput = Untrusted<z.input<typeof deleteCategorySchema>>;
