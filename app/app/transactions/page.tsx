import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { TransactionList } from "@/components/transactions/transaction-list";
import { getRecentTransactions } from "@/lib/data/transactions";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const user = await requireUser();
  const transactions = await getRecentTransactions(user.id);

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Your latest income and expenses. Tap one to edit it."
      />
      <TransactionList transactions={transactions} />
    </>
  );
}
