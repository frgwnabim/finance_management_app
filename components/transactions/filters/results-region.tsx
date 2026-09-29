"use client";

import type { ReactNode } from "react";

import { useTransactionFilters } from "@/components/transactions/filters/transaction-filters-provider";
import { cn } from "@/lib/utils";

/** Dims the current results while new ones load after a filter change. */
export function ResultsRegion({ children }: { children: ReactNode }) {
  const { isPending } = useTransactionFilters();

  return (
    <div aria-busy={isPending} className={cn("transition-opacity", isPending && "opacity-60")}>
      {children}
    </div>
  );
}
