import type { Metadata } from "next";

import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AppHomePage() {
  const user = await requireUser();

  return (
    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
      Welcome, {user.name}
    </h1>
  );
}
