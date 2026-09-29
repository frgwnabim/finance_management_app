"use client";

import { CategoryIcon } from "@/components/categories/category-icon";
import { useTransactionDialog } from "@/components/transactions/transaction-dialog-provider";
import type { TransactionListItem } from "@/lib/data/transactions";
import { formatDateOnly } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/utils";

const SHORT_DATE: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };

/** Compact list; tapping a row opens the shared edit dialog. */
export function RecentTransactionList({ transactions }: { transactions: TransactionListItem[] }) {
  const { openEdit } = useTransactionDialog();

  return (
    <ul className="-mx-2 flex flex-col">
      {transactions.map((transaction) => {
        const sign = transaction.type === "INCOME" ? "+" : "-";
        const amount = `${sign}${formatRupiah(transaction.amount)}`;
        return (
          <li key={transaction.id}>
            <button
              type="button"
              onClick={() =>
                openEdit({
                  id: transaction.id,
                  type: transaction.type,
                  amount: transaction.amount,
                  categoryId: transaction.categoryId,
                  date: transaction.date,
                  note: transaction.note ?? "",
                })
              }
              aria-label={`Edit ${transaction.category.name} ${amount}`}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:hover:bg-zinc-800/50"
            >
              <CategoryIcon
                icon={transaction.category.icon}
                color={transaction.category.color}
                size="sm"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {transaction.category.name}
                </span>
                <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {[formatDateOnly(transaction.date, SHORT_DATE), transaction.note]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-sm font-semibold whitespace-nowrap tabular-nums",
                  transaction.type === "INCOME"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {amount}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
