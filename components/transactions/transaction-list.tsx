"use client";

import { Pencil, Trash } from "lucide-react";
import { useState, useTransition } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { useTransactionDialog } from "@/components/transactions/transaction-dialog-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { deleteTransaction } from "@/lib/actions/transactions";
import type { TransactionListItem } from "@/lib/data/transactions";
import { formatDateOnly } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/utils";

type Transaction = TransactionListItem;

function groupByDate(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    const group = groups.get(transaction.date) ?? [];
    group.push(transaction);
    groups.set(transaction.date, group);
  }
  return [...groups.entries()];
}

function signedAmount(transaction: Pick<Transaction, "type" | "amount">) {
  return `${transaction.type === "INCOME" ? "+" : "-"}${formatRupiah(transaction.amount)}`;
}

function amountClass(transaction: Pick<Transaction, "type">) {
  return transaction.type === "INCOME"
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400";
}

const SHORT_DATE: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

type RowActions = {
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

type TransactionListProps = {
  transactions: Transaction[];
  /** Group rows under date headings (only meaningful when sorted by date). */
  grouped: boolean;
};

/** Table on desktop, card list on mobile. Edit opens the shared dialog; delete asks first. */
export function TransactionList({ transactions, grouped }: TransactionListProps) {
  const { openEdit } = useTransactionDialog();
  const [toDelete, setToDelete] = useState<Transaction | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const actions: RowActions = {
    onEdit: (transaction) =>
      openEdit({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        date: transaction.date,
        note: transaction.note ?? "",
      }),
    onDelete: setToDelete,
  };

  const groups: [string | null, Transaction[]][] = grouped
    ? groupByDate(transactions)
    : [[null, transactions]];

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
      <TransactionTable groups={groups} showDate={!grouped} {...actions} />
      <TransactionCards groups={groups} showDate={!grouped} {...actions} />

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
              <Button variant="secondary" onClick={() => setToDelete(null)} disabled={isDeleting}>
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

type ViewProps = RowActions & {
  groups: [string | null, Transaction[]][];
  showDate: boolean;
};

function TransactionTable({ groups, showDate, onEdit, onDelete }: ViewProps) {
  const columnCount = showDate ? 5 : 4;

  return (
    <Card className="hidden overflow-hidden p-0 sm:p-0 md:block">
      <table className="w-full table-fixed text-sm">
        <thead className="bg-zinc-50 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase dark:bg-zinc-900/60 dark:text-zinc-400">
          <tr>
            <th scope="col" className="w-[30%] px-6 py-3">Category</th>
            <th scope="col" className="px-3 py-3">Note</th>
            {showDate ? <th scope="col" className="w-32 px-3 py-3">Date</th> : null}
            <th scope="col" className="w-44 px-3 py-3 text-right">Amount</th>
            <th scope="col" className="w-28 px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        {groups.map(([date, rows]) => (
          <tbody key={date ?? "all"} className="divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {date ? (
              <tr className="bg-zinc-50/60 dark:bg-zinc-950/40">
                <th
                  scope="rowgroup"
                  colSpan={columnCount}
                  className="px-6 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400"
                >
                  {formatDateOnly(date)}
                </th>
              </tr>
            ) : null}
            {rows.map((transaction) => (
              <tr key={transaction.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="px-6 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <CategoryIcon
                      icon={transaction.category.icon}
                      color={transaction.category.color}
                      size="sm"
                    />
                    <span className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {transaction.category.name}
                    </span>
                  </div>
                </td>
                <td className="truncate px-3 py-3 text-zinc-600 dark:text-zinc-400" title={transaction.note ?? undefined}>
                  {transaction.note}
                </td>
                {showDate ? (
                  <td className="px-3 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                    {formatDateOnly(transaction.date, SHORT_DATE)}
                  </td>
                ) : null}
                <td className={cn("px-3 py-3 text-right font-semibold whitespace-nowrap tabular-nums", amountClass(transaction))}>
                  {signedAmount(transaction)}
                </td>
                <td className="px-6 py-2">
                  <RowButtons transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </Card>
  );
}

function TransactionCards({ groups, showDate, onEdit, onDelete }: ViewProps) {
  return (
    <div className="flex flex-col gap-6 md:hidden">
      {groups.map(([date, rows]) => (
        <section key={date ?? "all"} aria-label={date ? formatDateOnly(date) : "Transactions"}>
          {date ? (
            <h2 className="mb-2 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {formatDateOnly(date)}
            </h2>
          ) : null}
          <Card className="p-0 sm:p-0">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {rows.map((transaction) => (
                <li key={transaction.id} className="flex items-center gap-1 pr-2">
                  <button
                    type="button"
                    onClick={() => onEdit(transaction)}
                    aria-label={`Edit ${transaction.category.name} ${signedAmount(transaction)}`}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-3 pl-4 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:hover:bg-zinc-800/50"
                  >
                    <CategoryIcon icon={transaction.category.icon} color={transaction.category.color} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-zinc-900 dark:text-zinc-50">
                        {transaction.category.name}
                      </span>
                      {transaction.note || showDate ? (
                        <span className="block truncate text-sm text-zinc-500 dark:text-zinc-400">
                          {[showDate && formatDateOnly(transaction.date, SHORT_DATE), transaction.note]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      ) : null}
                    </span>
                    <span className={cn("shrink-0 pr-2 font-semibold whitespace-nowrap tabular-nums", amountClass(transaction))}>
                      {signedAmount(transaction)}
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction)}
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
  );
}

function RowButtons({
  transaction,
  onEdit,
  onDelete,
}: RowActions & { transaction: Transaction }) {
  const label = `${transaction.category.name} ${signedAmount(transaction)}`;
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)} aria-label={`Edit ${label}`} title="Edit">
        <Pencil className="size-4" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(transaction)}
        aria-label={`Delete ${label}`}
        title="Delete"
        className="text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      >
        <Trash className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
