import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 mb-6 h-4 w-72 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="mt-4 h-64 rounded-2xl" />
    </div>
  );
}
