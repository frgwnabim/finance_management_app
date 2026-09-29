"use client";

import { Download } from "lucide-react";

import { useTransactionFilters } from "@/components/transactions/filters/transaction-filters-provider";
import { toast } from "@/components/ui/toast";
import { toQueryString } from "@/lib/transaction-filters";

/**
 * Downloads every transaction matching the current search and filters
 * (not just the visible page) as CSV.
 */
export function ExportCsvButton() {
  const { filters } = useTransactionFilters();
  const href = `/api/transactions/export${toQueryString({ ...filters, page: 1 })}`;

  return (
    <a
      href={href}
      download
      onClick={() => toast.success("Exporting transactions as CSV.")}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      <Download className="size-4" aria-hidden />
      Export CSV
    </a>
  );
}
