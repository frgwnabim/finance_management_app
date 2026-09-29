import { Repeat } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Recurring" };

export default function RecurringPage() {
  return (
    <>
      <PageHeader title="Recurring" description="Transactions that repeat automatically." />
      <EmptyState
        icon={Repeat}
        title="Recurring coming soon"
        description="Manage salaries, subscriptions and bills that repeat on a schedule."
      />
    </>
  );
}
