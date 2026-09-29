"use client";

import { FlaskConical, RotateCcw } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { resetDemoDataAction } from "@/lib/actions/demo";

/** Shown to visitors in the shared demo account. */
export function DemoBanner() {
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    startTransition(async () => {
      const result = await resetDemoDataAction();
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <div className="border-b border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
      <div className="flex items-center justify-between gap-x-4 px-4 py-1.5 text-sm md:px-8">
        <p className="flex items-center gap-2">
          <FlaskConical className="size-4 shrink-0" aria-hidden />
          <span className="sm:hidden">Demo account. Data resets daily.</span>
          <span className="hidden sm:inline">
            You&apos;re exploring the demo account. Feel free to change anything: the data resets
            every day.
          </span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          isLoading={isPending}
          className="text-sky-900 hover:bg-sky-100 dark:text-sky-200 dark:hover:bg-sky-900/40"
        >
          {isPending ? null : <RotateCcw className="size-4" aria-hidden />}
          Reset demo data
        </Button>
      </div>
    </div>
  );
}
