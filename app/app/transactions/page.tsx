import { ArrowLeftRight, SearchX } from "lucide-react";
import type { Metadata } from "next";

import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { ResetFiltersButton } from "@/components/transactions/filters/reset-filters-button";
import { ResultsRegion } from "@/components/transactions/filters/results-region";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionPagination } from "@/components/transactions/transaction-pagination";
import { TransactionSummary } from "@/components/transactions/transaction-summary";
import { EmptyState } from "@/components/ui/empty-state";
import { getTransactionsPage } from "@/lib/data/transactions";
import { requireUser } from "@/lib/session";
import { hasAnyFilter, parseTransactionFilters } from "@/lib/transaction-filters";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage({ searchParams }: PageProps<"/app/transactions">) {
  const user = await requireUser();
  const filters = parseTransactionFilters(await searchParams);
  const { transactions, total, page, pageCount, summary } = await getTransactionsPage(
    user.id,
    filters,
  );
  const isFiltered = hasAnyFilter(filters);

  if (total === 0 && !isFiltered) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="No transactions yet"
        description="Add your first income or expense to start tracking your money."
        action={<AddTransactionButton />}
      />
    );
  }

  return (
    <ResultsRegion>
      <TransactionSummary {...summary} count={total} />
      {total === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching transactions"
          description="Try a different search or loosen your filters."
          action={<ResetFiltersButton />}
        />
      ) : (
        <>
          <TransactionList
            transactions={transactions}
            grouped={filters.sort.startsWith("date")}
          />
          <TransactionPagination
            filters={filters}
            page={page}
            pageCount={pageCount}
            total={total}
          />
        </>
      )}
    </ResultsRegion>
  );
}
