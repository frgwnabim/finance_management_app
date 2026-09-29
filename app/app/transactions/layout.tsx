import { PageHeader } from "@/components/layout/page-header";
import { TransactionFilterBar } from "@/components/transactions/filters/transaction-filter-bar";
import { TransactionFiltersProvider } from "@/components/transactions/filters/transaction-filters-provider";
import { getCategoryOptions } from "@/lib/data/categories";
import { requireUser } from "@/lib/session";

// The filter bar lives in the layout, which isn't re-rendered when only the
// query string changes, so the search box keeps focus while results reload.
export default async function TransactionsLayout({ children }: LayoutProps<"/app/transactions">) {
  const user = await requireUser();
  const categories = await getCategoryOptions(user.id);

  return (
    <TransactionFiltersProvider>
      <PageHeader title="Transactions" description="Search, filter and manage your transactions." />
      <TransactionFilterBar categories={categories} />
      {children}
    </TransactionFiltersProvider>
  );
}
