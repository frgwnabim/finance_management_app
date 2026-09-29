import type { TransactionType } from "@/lib/generated/prisma/client";

/** Preset palette for categories: hex value -> accessible name. */
export const CATEGORY_COLORS = {
  "#10b981": "Emerald",
  "#22c55e": "Green",
  "#84cc16": "Lime",
  "#eab308": "Yellow",
  "#f59e0b": "Amber",
  "#f97316": "Orange",
  "#ef4444": "Red",
  "#f43f5e": "Rose",
  "#ec4899": "Pink",
  "#d946ef": "Fuchsia",
  "#a855f7": "Purple",
  "#8b5cf6": "Violet",
  "#6366f1": "Indigo",
  "#3b82f6": "Blue",
  "#0ea5e9": "Sky",
  "#06b6d4": "Cyan",
  "#14b8a6": "Teal",
  "#64748b": "Slate",
} as const;

export type CategoryColor = keyof typeof CATEGORY_COLORS;

export const CATEGORY_COLOR_VALUES = Object.keys(CATEGORY_COLORS) as [
  CategoryColor,
  ...CategoryColor[],
];

/** Icon names (lucide, kebab-case) a category may use. */
export const CATEGORY_ICONS = [
  "briefcase",
  "laptop",
  "gift",
  "circle-plus",
  "banknote",
  "hand-coins",
  "trending-up",
  "landmark",
  "piggy-bank",
  "wallet",
  "utensils",
  "coffee",
  "shopping-cart",
  "shopping-bag",
  "car",
  "fuel",
  "bus",
  "plane",
  "house",
  "zap",
  "wifi",
  "smartphone",
  "receipt",
  "clapperboard",
  "gamepad-2",
  "music",
  "heart-pulse",
  "pill",
  "graduation-cap",
  "book-open",
  "shirt",
  "baby",
  "paw-print",
  "dumbbell",
  "sparkles",
  "ellipsis",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
};
