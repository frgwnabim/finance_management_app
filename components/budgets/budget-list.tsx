"use client";

import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

import { BudgetForm } from "@/components/budgets/budget-form";
import { BudgetProgressBar, BudgetStatusLabel } from "@/components/budgets/budget-progress";
import { CategoryIcon } from "@/components/categories/category-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import type { BudgetRow } from "@/lib/data/budgets";
import { getBudgetRatio } from "@/lib/budgets";
import { formatRupiah } from "@/lib/money";
import { cn } from "@/lib/utils";

export function BudgetList({ rows, month }: { rows: BudgetRow[]; month: string }) {
  const [editing, setEditing] = useState<{ row: BudgetRow; key: number } | null>(null);
  const close = () => setEditing(null);

  return (
    <>
      <Card className="p-0 sm:p-0">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((row) => (
            <BudgetListRow
              key={row.category.id}
              row={row}
              onEdit={() => setEditing({ row, key: Date.now() })}
            />
          ))}
        </ul>
      </Card>

      <Dialog
        open={editing !== null}
        onClose={close}
        title={editing?.row.budget ? "Edit budget" : "Set budget"}
      >
        {editing ? (
          <BudgetForm
            key={editing.key}
            row={editing.row}
            month={month}
            onDone={close}
            onCancel={close}
          />
        ) : null}
      </Dialog>
    </>
  );
}

function BudgetListRow({ row, onEdit }: { row: BudgetRow; onEdit: () => void }) {
  const { category, budget, spent } = row;

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <CategoryIcon icon={category.icon} color={category.color} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{category.name}</p>
          {budget ? (
            <BudgetStatusLabel spent={spent} amount={budget.amount} className="text-sm" />
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No budget · {formatRupiah(spent)} spent
            </p>
          )}
        </div>
        {budget ? (
          <span className="hidden text-sm font-semibold text-zinc-900 tabular-nums sm:inline dark:text-zinc-50">
            {Math.round(getBudgetRatio(spent, budget.amount) * 100)}%
          </span>
        ) : null}
        <Button
          variant={budget ? "ghost" : "secondary"}
          size="sm"
          onClick={onEdit}
          aria-label={budget ? `Edit ${category.name} budget` : `Set ${category.name} budget`}
        >
          {budget ? <Pencil className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          <span className={cn(budget && "sr-only sm:not-sr-only")}>
            {budget ? "Edit" : "Set budget"}
          </span>
        </Button>
      </div>

      {budget ? (
        <>
          <BudgetProgressBar
            spent={spent}
            amount={budget.amount}
            label={`${category.name} budget used`}
          />
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <Amount label="Budget" value={formatRupiah(budget.amount)} />
            <Amount label="Spent" value={formatRupiah(spent)} />
            <Amount
              label={spent > budget.amount ? "Over" : "Remaining"}
              value={formatRupiah(Math.abs(budget.amount - spent))}
              valueClassName={spent > budget.amount ? "text-red-600 dark:text-red-400" : undefined}
              className="text-right"
            />
          </dl>
        </>
      ) : null}
    </li>
  );
}

function Amount({
  label,
  value,
  valueClassName,
  className,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd
        className={cn(
          "truncate font-medium text-zinc-900 tabular-nums dark:text-zinc-100",
          valueClassName,
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
