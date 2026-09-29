"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, use, useOptimistic, useTransition, type ReactNode } from "react";

import {
  DEFAULT_FILTERS,
  parseTransactionFilters,
  searchParamsToRecord,
  toQueryString,
  type TransactionFilters,
} from "@/lib/transaction-filters";

type TransactionFiltersContextValue = {
  /** Current filters, including changes whose results are still loading. */
  filters: TransactionFilters;
  /** Merges a change into the URL. Any change except `page` goes back to page 1. */
  setFilters: (patch: Partial<TransactionFilters>) => void;
  /** Clears search and filters, keeping the sort order. */
  resetFilters: () => void;
  isPending: boolean;
};

const TransactionFiltersContext = createContext<TransactionFiltersContextValue | null>(null);

export function TransactionFiltersProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const urlFilters = parseTransactionFilters(searchParamsToRecord(searchParams));

  // useSearchParams only updates once a navigation finishes. The optimistic
  // copy updates immediately, so controls show the new value and a second
  // quick change builds on the first instead of overwriting it.
  const [filters, setOptimisticFilters] = useOptimistic(urlFilters);

  function navigate(next: TransactionFilters) {
    startTransition(() => {
      setOptimisticFilters(next);
      router.replace(`${pathname}${toQueryString(next)}`, { scroll: false });
    });
  }

  const value: TransactionFiltersContextValue = {
    filters,
    isPending,
    setFilters: (patch) => navigate({ ...filters, page: 1, ...patch }),
    resetFilters: () => navigate({ ...DEFAULT_FILTERS, sort: filters.sort }),
  };

  return <TransactionFiltersContext value={value}>{children}</TransactionFiltersContext>;
}

export function useTransactionFilters() {
  const context = use(TransactionFiltersContext);
  if (!context) {
    throw new Error("useTransactionFilters must be used inside TransactionFiltersProvider");
  }
  return context;
}
