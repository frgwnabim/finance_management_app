"use client";

import { Plus } from "lucide-react";

import { useTransactionDialog } from "@/components/transactions/transaction-dialog-provider";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Regular button that opens the Add Transaction dialog. */
export function AddTransactionButton({ className, ...props }: ButtonProps) {
  const { openCreate } = useTransactionDialog();

  return (
    <Button onClick={openCreate} className={className} {...props}>
      <Plus className="size-4" aria-hidden />
      Add transaction
    </Button>
  );
}

/** Floating action button for mobile, sitting above the bottom nav. */
export function AddTransactionFab() {
  const { openCreate } = useTransactionDialog();

  return (
    <button
      type="button"
      onClick={openCreate}
      aria-label="Add transaction"
      className={cn(
        "fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 flex size-14 items-center justify-center rounded-full shadow-lg md:hidden",
        "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400",
        "transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
      )}
    >
      <Plus className="size-6" aria-hidden />
    </button>
  );
}
