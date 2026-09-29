"use client";

import { Copy } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { copyBudgetsFromPreviousMonth } from "@/lib/actions/budgets";
import { formatMonth } from "@/lib/dates";
import { pluralize } from "@/lib/utils";

type CopyBudgetsButtonProps = {
  month: string;
  previousMonth: string;
  /** Budgets from the previous month for categories not budgeted yet. */
  copyableCount: number;
};

export function CopyBudgetsButton({ month, previousMonth, copyableCount }: CopyBudgetsButtonProps) {
  const [isPending, startTransition] = useTransition();
  const previousName = formatMonth(previousMonth, { month: "long" });

  function handleCopy() {
    startTransition(async () => {
      const result = await copyBudgetsFromPreviousMonth({ month });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <Button
      variant="secondary"
      onClick={handleCopy}
      isLoading={isPending}
      disabled={copyableCount === 0}
      title={
        copyableCount === 0
          ? `Nothing to copy from ${previousName}`
          : `Copy ${pluralize(copyableCount, "budget")} from ${previousName}. Existing budgets are kept.`
      }
    >
      {isPending ? null : <Copy className="size-4" aria-hidden />}
      Copy from {previousName}
    </Button>
  );
}
