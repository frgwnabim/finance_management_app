import type { Metadata } from "next";
import { Suspense } from "react";

import { BudgetOverview } from "@/components/dashboard/budget-overview";
import {
  BudgetOverviewSkeleton,
  RecentTransactionsSkeleton,
  SpendingChartSkeleton,
  SummaryCardsSkeleton,
} from "@/components/dashboard/dashboard-skeletons";
import { RecentTransactionsCard } from "@/components/dashboard/recent-transactions-card";
import { SpendingChartCard } from "@/components/dashboard/spending-chart-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PageHeader } from "@/components/layout/page-header";
import { todayInAppTimeZone } from "@/lib/dates";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const today = todayInAppTimeZone();

  // Each section streams in on its own with a matching skeleton.
  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${user.name}.`} />
      <div className="flex flex-col gap-6">
        <Suspense fallback={<SummaryCardsSkeleton />}>
          <SummaryCards userId={user.id} today={today} />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-3">
            <Suspense fallback={<SpendingChartSkeleton />}>
              <SpendingChartCard userId={user.id} today={today} />
            </Suspense>
          </div>
          <div className="min-w-0 lg:col-span-2">
            <Suspense fallback={<RecentTransactionsSkeleton />}>
              <RecentTransactionsCard userId={user.id} />
            </Suspense>
          </div>
        </div>

        <Suspense fallback={<BudgetOverviewSkeleton />}>
          <BudgetOverview userId={user.id} today={today} />
        </Suspense>
      </div>
    </>
  );
}
