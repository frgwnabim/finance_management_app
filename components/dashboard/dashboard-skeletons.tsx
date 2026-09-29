import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCardsSkeleton() {
  return (
    <div role="status" aria-label="Loading summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <Card key={index} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-36" />
        </Card>
      ))}
    </div>
  );
}

export function SpendingChartSkeleton() {
  const heights = ["40%", "65%", "50%", "80%", "55%", "35%"];
  return (
    <Card role="status" aria-label="Loading spending chart" className="h-full">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 mb-6 h-4 w-52" />
      <div className="flex h-64 items-end justify-around gap-4 border-b border-zinc-200 pb-px pl-16 dark:border-zinc-800">
        {heights.map((height, index) => (
          <Skeleton key={index} className="w-6 rounded-b-none" style={{ height }} />
        ))}
      </div>
    </Card>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <Card role="status" aria-label="Loading recent transactions" className="h-full">
      <div className="mb-4 flex justify-between">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-16" />
      </div>
      <ul className="flex flex-col gap-4">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className="flex items-center gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32 max-w-full" />
            </div>
            <Skeleton className="h-3.5 w-20" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function BudgetOverviewSkeleton() {
  return (
    <Card role="status" aria-label="Loading budgets">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="mt-2 mb-6 h-4 w-56" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </Card>
  );
}
