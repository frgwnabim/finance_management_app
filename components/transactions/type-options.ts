import type { SegmentedOption } from "@/components/ui/segmented-control";
import type { TransactionType } from "@/lib/generated/prisma/client";

export const TRANSACTION_TYPE_OPTIONS: SegmentedOption<TransactionType>[] = [
  {
    value: "EXPENSE",
    label: "Expense",
    activeClassName:
      "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  },
  {
    value: "INCOME",
    label: "Income",
    activeClassName:
      "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
];
