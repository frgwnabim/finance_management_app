import { PiggyBank } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Budgets" };

export default function BudgetsPage() {
  return (
    <>
      <PageHeader title="Budgets" description="Monthly spending limits per category." />
      <EmptyState
        icon={PiggyBank}
        title="Budgets coming soon"
        description="You'll be able to set monthly budgets and track progress here."
      />
    </>
  );
}
