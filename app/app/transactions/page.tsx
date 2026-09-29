import { ArrowLeftRight } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Transactions" };

export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" description="All your income and expenses." />
      <EmptyState
        icon={ArrowLeftRight}
        title="Transactions coming soon"
        description="You'll be able to add, edit, search and filter transactions here."
      />
    </>
  );
}
