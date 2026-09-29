import { ArrowLeftRight } from "lucide-react";

import { RecentTransactionList } from "@/components/dashboard/recent-transaction-list";
import { SectionHeader } from "@/components/dashboard/section-header";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getRecentTransactions } from "@/lib/data/transactions";

export async function RecentTransactionsCard({ userId }: { userId: string }) {
  const transactions = await getRecentTransactions(userId, 8);

  return (
    <Card className="h-full">
      <SectionHeader
        title="Recent transactions"
        href={transactions.length > 0 ? "/app/transactions" : undefined}
        linkLabel="View all"
      />
      {transactions.length > 0 ? (
        <RecentTransactionList transactions={transactions} />
      ) : (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transactions yet"
          description="Add your first income or expense to see it here."
          action={<AddTransactionButton />}
          className="border-none py-10"
        />
      )}
    </Card>
  );
}
