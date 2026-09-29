import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Covers the results only; the header and filter bar come from the layout.
export default function TransactionsLoading() {
  return (
    <div role="status" aria-label="Loading transactions">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton
            key={index}
            className={index === 2 ? "col-span-2 h-[74px] rounded-2xl sm:col-span-1" : "h-[74px] rounded-2xl"}
          />
        ))}
      </div>
      <Skeleton className="mb-4 h-3 w-48" />
      <Card className="p-0 sm:p-0">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index} className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <Skeleton className="size-10 shrink-0 rounded-full" />
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
  );
}
