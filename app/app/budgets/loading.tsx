import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetsLoading() {
  return (
    <div role="status" aria-label="Loading budgets">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      <Skeleton className="mb-6 h-10 w-64" />
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-36" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-5 h-3 w-full rounded-full" />
      </Card>
      <Card className="p-0 sm:p-0">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="flex flex-col gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
