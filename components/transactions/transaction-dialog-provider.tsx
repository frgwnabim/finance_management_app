"use client";

import { createContext, use, useState, type ReactNode } from "react";

import {
  TransactionForm,
  type TransactionFormValues,
} from "@/components/transactions/transaction-form";
import { Dialog } from "@/components/ui/dialog";
import type { CategoryOption } from "@/lib/data/categories";
import { todayLocal } from "@/lib/dates";

type EditableTransaction = Required<Omit<TransactionFormValues, "amount">> & {
  amount: number;
};

type TransactionDialogContextValue = {
  openCreate: () => void;
  openEdit: (transaction: EditableTransaction) => void;
};

const TransactionDialogContext = createContext<TransactionDialogContextValue | null>(null);

type DialogState =
  | { mode: "create"; key: number }
  | { mode: "edit"; key: number; transaction: EditableTransaction };

/** Owns the single Add/Edit Transaction dialog, so any page or button can open it. */
export function TransactionDialogProvider({
  categories,
  children,
}: {
  categories: CategoryOption[];
  children: ReactNode;
}) {
  const [state, setState] = useState<DialogState | null>(null);
  const close = () => setState(null);

  const value: TransactionDialogContextValue = {
    openCreate: () => setState({ mode: "create", key: Date.now() }),
    openEdit: (transaction) => setState({ mode: "edit", key: Date.now(), transaction }),
  };

  let initialValues: TransactionFormValues | null = null;
  if (state?.mode === "edit") {
    initialValues = state.transaction;
  } else if (state?.mode === "create") {
    initialValues = {
      type: "EXPENSE",
      amount: null,
      categoryId: categories.find((category) => category.type === "EXPENSE")?.id ?? "",
      date: todayLocal(),
      note: "",
    };
  }

  return (
    <TransactionDialogContext value={value}>
      {children}
      <Dialog
        open={state !== null}
        onClose={close}
        title={state?.mode === "edit" ? "Edit transaction" : "Add transaction"}
      >
        {state && initialValues ? (
          <TransactionForm
            key={state.key}
            categories={categories}
            initialValues={initialValues}
            onDone={close}
            onCancel={close}
          />
        ) : null}
      </Dialog>
    </TransactionDialogContext>
  );
}

export function useTransactionDialog() {
  const context = use(TransactionDialogContext);
  if (!context) {
    throw new Error("useTransactionDialog must be used inside TransactionDialogProvider");
  }
  return context;
}
