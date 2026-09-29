import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecurringLoading() {
  return (
    <div role="status" aria-label="Loading recurring transactions">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Card className="p-0 sm:p-0">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.from({ length: 4 }, (_, index) => (
            <li key={index} className="flex items-center gap-3 px-4 py-4 sm:px-6">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56 max-w-full" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
