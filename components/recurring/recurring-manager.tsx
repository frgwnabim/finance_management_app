"use client";

import { Pause, Pencil, Play, Plus, Repeat, Trash } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { PageHeader } from "@/components/layout/page-header";
import { RecurringForm, type RecurringFormValues } from "@/components/recurring/recurring-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { deleteRecurring, setRecurringActive } from "@/lib/actions/recurring";
import type { CategoryOption } from "@/lib/data/categories";
import type { RecurringItem, RecurringStatus } from "@/lib/data/recurring";
import { formatDateOnly, todayLocal } from "@/lib/dates";
import { formatRupiah } from "@/lib/money";
import { describeSchedule } from "@/lib/recurring-schedule";
import { cn, pluralize } from "@/lib/utils";

type DialogState =
  | { kind: "form"; key: number; values: RecurringFormValues }
  | { kind: "delete"; item: RecurringItem };

const STATUS_BADGES: Record<RecurringStatus, { label: string; variant: "success" | "warning" | "neutral" }> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "warning" },
  ended: { label: "Ended", variant: "neutral" },
};

export function RecurringManager({
  items,
  categories,
}: {
  items: RecurringItem[];
  categories: CategoryOption[];
}) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [isDeleting, startDelete] = useTransition();
  // A fresh key per open resets the form state.
  const formKey = useRef(0);
  const close = () => setDialog(null);

  function openCreate() {
    setDialog({
      kind: "form",
      key: ++formKey.current,
      values: {
        type: "EXPENSE",
        amount: null,
        categoryId: categories.find((category) => category.type === "EXPENSE")?.id ?? "",
        frequency: "MONTHLY",
        startDate: todayLocal(),
        endDate: "",
        note: "",
      },
    });
  }

  function openEdit(item: RecurringItem) {
    setDialog({
      kind: "form",
      key: ++formKey.current,
      values: {
        id: item.id,
        type: item.type,
        amount: item.amount,
        categoryId: item.categoryId,
        frequency: item.frequency,
        startDate: item.startDate,
        endDate: item.endDate ?? "",
        note: item.note ?? "",
      },
    });
  }

  function confirmDelete(item: RecurringItem) {
    startDelete(async () => {
      const result = await deleteRecurring({ id: item.id });
      if (result.ok) {
        toast.success(result.message);
        close();
      } else {
        toast.error(result.message);
      }
    });
  }

  const deleting = dialog?.kind === "delete" ? dialog.item : null;

  return (
    <>
      <PageHeader
        title="Recurring"
        description="Salaries, subscriptions and bills that repeat on a schedule."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" aria-hidden />
            New recurring
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No recurring transactions"
          description="Add your salary, rent or subscriptions once and they'll be recorded automatically."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" aria-hidden />
              New recurring
            </Button>
          }
        />
      ) : (
        <Card className="p-0 sm:p-0">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((item) => (
              <RecurringRow
                key={item.id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => setDialog({ kind: "delete", item })}
              />
            ))}
          </ul>
        </Card>
      )}

      <Dialog
        open={dialog?.kind === "form"}
        onClose={close}
        title={dialog?.kind === "form" && dialog.values.id ? "Edit recurring" : "New recurring"}
      >
        {dialog?.kind === "form" ? (
          <RecurringForm
            key={dialog.key}
            categories={categories}
            initialValues={dialog.values}
            onDone={close}
            onCancel={close}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={deleting !== null}
        onClose={close}
        title="Delete recurring item?"
        description={
          deleting && deleting.generatedCount > 0
            ? `The ${pluralize(deleting.generatedCount, "transaction")} it already created will be kept.`
            : "No new transactions will be created."
        }
      >
        {deleting ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={close} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => confirmDelete(deleting)} isLoading={isDeleting}>
              Delete
            </Button>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}

function RecurringRow({
  item,
  onEdit,
  onDelete,
}: {
  item: RecurringItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isToggling, startToggle] = useTransition();
  const title = item.note || item.category.name;
  const badge = STATUS_BADGES[item.status];

  function toggleActive() {
    startToggle(async () => {
      const result = await setRecurringActive({ id: item.id, isActive: !item.isActive });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <li className={cn("flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6", item.status !== "active" && "opacity-75")}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <CategoryIcon icon={item.category.icon} color={item.category.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{title}</p>
            <Badge variant={badge.variant} className="shrink-0">{badge.label}</Badge>
          </div>
          <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {[item.note ? item.category.name : null, describeSchedule(item.frequency, item.startDate)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <AmountInfo item={item} className="hidden text-right sm:block" />
      </div>

      <div className="flex items-center gap-1 sm:pl-2">
        {/* On phones the amount sits here, leaving the title room to breathe. */}
        <AmountInfo item={item} className="mr-auto sm:hidden" />
        {item.status !== "ended" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleActive}
            isLoading={isToggling}
            aria-label={`${item.isActive ? "Pause" : "Resume"} ${title}`}
          >
            {isToggling ? null : item.isActive ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {item.isActive ? "Pause" : "Resume"}
          </Button>
        ) : null}
        <Button variant="ghost" size="icon" onClick={onEdit} aria-label={`Edit ${title}`} title="Edit">
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label={`Delete ${title}`}
          title="Delete"
          className="text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <Trash className="size-4" aria-hidden />
        </Button>
      </div>
    </li>
  );
}

function AmountInfo({ item, className }: { item: RecurringItem; className?: string }) {
  const isIncome = item.type === "INCOME";
  const shortDate: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return (
    <div className={cn("shrink-0", className)}>
      <p
        className={cn(
          "font-semibold whitespace-nowrap tabular-nums",
          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
        )}
      >
        {isIncome ? "+" : "-"}
        {formatRupiah(item.amount)}
      </p>
      <p className="text-xs whitespace-nowrap text-zinc-500 dark:text-zinc-400">
        {item.nextDueDate
          ? `${item.status === "paused" ? "Would be" : "Next"} ${formatDateOnly(item.nextDueDate, shortDate)}`
          : item.endDate
            ? `Ended ${formatDateOnly(item.endDate, shortDate)}`
            : "Ended"}
      </p>
    </div>
  );
}
