import { LayoutDashboard } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${user.name}.`} />
      <EmptyState
        icon={LayoutDashboard}
        title="Dashboard coming soon"
        description="Your balance, monthly summary and recent transactions will appear here."
      />
    </>
  );
}
