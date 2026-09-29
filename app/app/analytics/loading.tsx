import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ChartCardSkeleton({ height = "h-64", className }: { height?: string; className?: string }) {
  return (
    <Card className={className}>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-2 mb-6 h-4 w-56" />
      <Skeleton className={`${height} w-full rounded-xl`} />
    </Card>
  );
}

export default function AnalyticsLoading() {
  return (
    <div role="status" aria-label="Loading analytics">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="mt-2 mb-6 h-4 w-72 max-w-full" />
      <Skeleton className="mb-6 h-10 w-full max-w-md rounded-lg" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-48" />
          </Card>
        ))}
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-2 mb-6 h-4 w-52" />
          <div className="flex items-center gap-6">
            <Skeleton className="size-44 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-3">
              {[0, 1, 2, 3, 4].map((index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </Card>
        <ChartCardSkeleton />
      </div>
      <ChartCardSkeleton height="h-72" className="mb-6" />
      <ChartCardSkeleton height="h-48" />
    </div>
  );
}
