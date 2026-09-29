import type { TransactionType } from "@/lib/generated/prisma/client";

type DefaultCategory = {
  name: string;
  type: TransactionType;
  color: string;
  // lucide icon name
  icon: string;
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Salary", type: "INCOME", color: "#10b981", icon: "briefcase" },
  { name: "Freelance", type: "INCOME", color: "#06b6d4", icon: "laptop" },
  { name: "Gift", type: "INCOME", color: "#f59e0b", icon: "gift" },
  { name: "Other Income", type: "INCOME", color: "#84cc16", icon: "circle-plus" },
  { name: "Food", type: "EXPENSE", color: "#f97316", icon: "utensils" },
  { name: "Transport", type: "EXPENSE", color: "#3b82f6", icon: "car" },
  { name: "Shopping", type: "EXPENSE", color: "#ec4899", icon: "shopping-bag" },
  { name: "Bills", type: "EXPENSE", color: "#ef4444", icon: "receipt" },
  { name: "Entertainment", type: "EXPENSE", color: "#a855f7", icon: "clapperboard" },
  { name: "Health", type: "EXPENSE", color: "#14b8a6", icon: "heart-pulse" },
  { name: "Education", type: "EXPENSE", color: "#6366f1", icon: "graduation-cap" },
  { name: "Other", type: "EXPENSE", color: "#64748b", icon: "ellipsis" },
];
