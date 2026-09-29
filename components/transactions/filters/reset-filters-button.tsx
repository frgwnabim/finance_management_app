"use client";

import { RotateCcw } from "lucide-react";

import { useTransactionFilters } from "@/components/transactions/filters/transaction-filters-provider";
import { Button } from "@/components/ui/button";

export function ResetFiltersButton() {
  const { resetFilters } = useTransactionFilters();

  return (
    <Button variant="secondary" onClick={resetFilters}>
      <RotateCcw className="size-4" aria-hidden />
      Reset filters
    </Button>
  );
}
