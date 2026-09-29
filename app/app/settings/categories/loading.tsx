import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function GroupSkeleton({ rows }: { rows: number }) {
  return (
    <Card className="p-0 sm:p-0">
      <div className="border-b border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-800">
        <Skeleton className="h-5 w-24" />
      </div>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {Array.from({ length: rows }, (_, index) => (
          <li key={index} className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function CategoriesLoading() {
  return (
    <div role="status" aria-label="Loading categories">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 mb-6 h-4 w-64 max-w-full" />
      <div className="grid gap-6 lg:grid-cols-2">
        <GroupSkeleton rows={4} />
        <GroupSkeleton rows={8} />
      </div>
    </div>
  );
}
