import type { Metadata } from "next";

import { RecurringManager } from "@/components/recurring/recurring-manager";
import { getCategoryOptions } from "@/lib/data/categories";
import { getRecurringItems } from "@/lib/data/recurring";
import { todayInAppTimeZone } from "@/lib/dates";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Recurring" };

export default async function RecurringPage() {
  const user = await requireUser();
  const [items, categories] = await Promise.all([
    getRecurringItems(user.id, todayInAppTimeZone()),
    getCategoryOptions(user.id),
  ]);

  return <RecurringManager items={items} categories={categories} />;
}
