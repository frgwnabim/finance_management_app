import { ChartPie } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="See where your money goes." />
      <EmptyState
        icon={ChartPie}
        title="Analytics coming soon"
        description="Charts of spending by category and trends over time will appear here."
      />
    </>
  );
}
