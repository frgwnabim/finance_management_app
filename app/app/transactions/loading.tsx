import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div role="status" aria-label="Loading transactions">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="mt-2 mb-6 h-4 w-72 max-w-full" />
      <div className="flex flex-col gap-6">
        {[3, 2].map((rows, group) => (
          <div key={group}>
            <Skeleton className="mb-2 h-4 w-32" />
            <Card className="p-0 sm:p-0">
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {Array.from({ length: rows }, (_, index) => (
                  <li key={index} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40 max-w-full" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
