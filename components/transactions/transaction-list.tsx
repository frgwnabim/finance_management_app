"use client";

import { ArrowLeftRight, Trash } from "lucide-react";
import { useState, useTransition } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { useTransactionDialog } from "@/components/transactions/transaction-dialog-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { deleteTransaction } from "@/lib/actions/transactions";
import type { TransactionListItem } from "@/lib/data/transactions";
import { formatDateOnly } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/utils";

function groupByDate(transactions: TransactionListItem[]) {
  const groups = new Map<string, TransactionListItem[]>();
  for (const transaction of transactions) {
    const group = groups.get(transaction.date) ?? [];
    group.push(transaction);
    groups.set(transaction.date, group);
  }
  return [...groups.entries()];
}

function signedAmount(transaction: Pick<TransactionListItem, "type" | "amount">) {
  const sign = transaction.type === "INCOME" ? "+" : "-";
  return `${sign}${formatRupiah(transaction.amount)}`;
}

export function TransactionList({ transactions }: { transactions: TransactionListItem[] }) {
  const { openEdit } = useTransactionDialog();
  const [toDelete, setToDelete] = useState<TransactionListItem | null>(null);
  const [isDeleting, startDelete] = useTransition();

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="No transactions yet"
        description="Add your first income or expense to start tracking your money."
        action={<AddTransactionButton />}
      />
    );
  }

  function confirmDelete() {
    if (!toDelete) return;
    startDelete(async () => {
      const result = await deleteTransaction({ id: toDelete.id });
      if (result.ok) {
        toast.success(result.message);
        setToDelete(null);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {groupByDate(transactions).map(([date, items]) => (
          <section key={date} aria-label={formatDateOnly(date)}>
            <h2 className="mb-2 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {formatDateOnly(date)}
            </h2>
            <Card as="div" className="p-0 sm:p-0">
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((transaction) => (
                  <li key={transaction.id} className="flex items-center gap-1 pr-2">
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
                      aria-label={`Edit ${transaction.category.name} ${signedAmount(transaction)}`}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-3 pl-4 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-emerald-500 sm:pl-6 dark:hover:bg-zinc-800/50"
                    >
                      <CategoryIcon
                        icon={transaction.category.icon}
                        color={transaction.category.color}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-zinc-900 dark:text-zinc-50">
                          {transaction.category.name}
                        </span>
                        {transaction.note ? (
                          <span className="block truncate text-sm text-zinc-500 dark:text-zinc-400">
                            {transaction.note}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 pr-2 font-semibold whitespace-nowrap tabular-nums",
                          transaction.type === "INCOME"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {signedAmount(transaction)}
                      </span>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setToDelete(transaction)}
                      aria-label={`Delete ${transaction.category.name} ${signedAmount(transaction)}`}
                      title="Delete"
                      className="text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ))}
      </div>

      <Dialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="Delete transaction?"
        description="This can't be undone."
      >
        {toDelete ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
              <CategoryIcon icon={toDelete.category.icon} color={toDelete.category.color} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{toDelete.category.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateOnly(toDelete.date)}
                </p>
              </div>
              <span className="font-semibold whitespace-nowrap tabular-nums">
                {signedAmount(toDelete)}
              </span>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => setToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
