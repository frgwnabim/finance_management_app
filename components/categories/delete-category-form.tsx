"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { deleteCategory } from "@/lib/actions/categories";
import { TRANSACTION_TYPE_LABELS } from "@/lib/categories";
import type { CategoryWithUsage } from "@/lib/data/categories";
import { pluralize } from "@/lib/utils";

type DeleteCategoryFormProps = {
  category: CategoryWithUsage;
  /** Other categories of the same type, to move transactions to. */
  moveTargets: CategoryWithUsage[];
  onDone: () => void;
  onCancel: () => void;
};

export function DeleteCategoryForm({
  category,
  moveTargets,
  onDone,
  onCancel,
}: DeleteCategoryFormProps) {
  const router = useRouter();
  const selectId = useId();
  const [moveToId, setMoveToId] = useState(moveTargets[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  const usage = [
    category.transactionCount > 0 && pluralize(category.transactionCount, "transaction"),
    category.recurringCount > 0 && pluralize(category.recurringCount, "recurring rule"),
  ].filter(Boolean);
  const isInUse = usage.length > 0;
  const canMove = moveTargets.length > 0;
  const typeLabel = TRANSACTION_TYPE_LABELS[category.type].toLowerCase();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategory({
        id: category.id,
        moveToId: isInUse ? moveToId : undefined,
      });
      if (result.ok) {
        toast.success(result.message);
        onDone();
      } else {
        toast.error(result.message);
        // Usage may have changed since the page loaded.
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-3">
        <CategoryIcon icon={category.icon} color={category.color} size="sm" />
        <span className="font-medium">{category.name}</span>
      </div>

      {isInUse ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          This category is used by {usage.join(" and ")}. It can&apos;t be deleted
          until they are moved to another {typeLabel} category.
        </div>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">This can&apos;t be undone.</p>
      )}

      {isInUse && canMove ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={selectId}>Move them to</Label>
          <Select
            id={selectId}
            value={moveToId}
            onChange={(event) => setMoveToId(event.target.value)}
          >
            {moveTargets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}

      {isInUse && !canMove ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          You don&apos;t have another {typeLabel} category yet. Create one first, then
          come back to move these and delete this category.
        </p>
      ) : null}

      {category.budgetCount > 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          {pluralize(category.budgetCount, "budget")} for this category will also be
          deleted.
        </p>
      ) : null}

      <DialogFooter>
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        {!isInUse || canMove ? (
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isPending}
            disabled={isInUse && !moveToId}
          >
            {isInUse ? "Move and delete" : "Delete"}
          </Button>
        ) : null}
      </DialogFooter>
    </div>
  );
}
