"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CategoryForm, type CategoryFormValues } from "@/components/categories/category-form";
import { CategoryGroup } from "@/components/categories/category-group";
import { DeleteCategoryForm } from "@/components/categories/delete-category-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { CategoryWithUsage } from "@/lib/data/categories";
import type { TransactionType } from "@/lib/generated/prisma/client";

type DialogState =
  | { kind: "create"; type: TransactionType }
  | { kind: "edit"; category: CategoryWithUsage }
  | { kind: "delete"; category: CategoryWithUsage };

const NEW_CATEGORY_DEFAULTS: Record<TransactionType, Omit<CategoryFormValues, "type">> = {
  INCOME: { name: "", color: "#10b981", icon: "wallet" },
  EXPENSE: { name: "", color: "#3b82f6", icon: "shopping-bag" },
};

export function CategoryManager({ categories }: { categories: CategoryWithUsage[] }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  // A new key per open resets the form state inside the dialog.
  const [dialogKey, setDialogKey] = useState(0);

  const income = categories.filter((category) => category.type === "INCOME");
  const expense = categories.filter((category) => category.type === "EXPENSE");

  function open(state: DialogState) {
    setDialogKey((key) => key + 1);
    setDialog(state);
  }

  const close = () => setDialog(null);

  const handlers = (type: TransactionType) => ({
    onAdd: () => open({ kind: "create", type }),
    onEdit: (category: CategoryWithUsage) => open({ kind: "edit", category }),
    onDelete: (category: CategoryWithUsage) => open({ kind: "delete", category }),
  });

  return (
    <>
      <PageHeader
        title="Categories"
        description="Organize your income and expenses."
        actions={
          <Button onClick={() => open({ kind: "create", type: "EXPENSE" })}>
            <Plus className="size-4" aria-hidden />
            New category
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryGroup title="Income" categories={income} {...handlers("INCOME")} />
        <CategoryGroup title="Expense" categories={expense} {...handlers("EXPENSE")} />
      </div>

      <Dialog
        open={dialog?.kind === "create" || dialog?.kind === "edit"}
        onClose={close}
        title={dialog?.kind === "edit" ? "Edit category" : "New category"}
      >
        {dialog?.kind === "create" ? (
          <CategoryForm
            key={dialogKey}
            initialValues={{ ...NEW_CATEGORY_DEFAULTS[dialog.type], type: dialog.type }}
            onDone={close}
            onCancel={close}
          />
        ) : null}
        {dialog?.kind === "edit" ? (
          <CategoryForm
            key={dialogKey}
            initialValues={{
              id: dialog.category.id,
              name: dialog.category.name,
              type: dialog.category.type,
              color: dialog.category.color,
              icon: dialog.category.icon,
            }}
            onDone={close}
            onCancel={close}
          />
        ) : null}
      </Dialog>

      <Dialog
        open={dialog?.kind === "delete"}
        onClose={close}
        title="Delete category"
      >
        {dialog?.kind === "delete" ? (
          <DeleteCategoryForm
            key={dialogKey}
            category={dialog.category}
            moveTargets={categories.filter(
              (category) =>
                category.type === dialog.category.type && category.id !== dialog.category.id,
            )}
            onDone={close}
            onCancel={close}
          />
        ) : null}
      </Dialog>
    </>
  );
}
