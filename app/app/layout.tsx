import type { Metadata } from "next";

import { DemoBanner } from "@/components/demo/demo-banner";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { RecurringSync } from "@/components/recurring/recurring-sync";
import { AddTransactionFab } from "@/components/transactions/add-transaction-button";
import { TransactionDialogProvider } from "@/components/transactions/transaction-dialog-provider";
import { getCategoryOptions } from "@/lib/data/categories";
import { isDemoUser } from "@/lib/demo";
import { requireUser } from "@/lib/session";

// Signed-in pages are private: keep them out of search results.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  // proxy.ts already guards /app; this also gives Server Components the user.
  const user = await requireUser();
  const categories = await getCategoryOptions(user.id);

  return (
    <TransactionDialogProvider categories={categories}>
      <div className="flex min-h-dvh flex-1 flex-col bg-zinc-50 md:pl-64 dark:bg-zinc-950">
        <Sidebar user={user} />
        <AppHeader />
        {isDemoUser(user) ? <DemoBanner /> : null}
        {/* Bottom padding keeps content clear of the fixed mobile bottom nav and FAB. */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-[calc(9rem+env(safe-area-inset-bottom))] md:px-8 md:pb-10">
          {children}
        </main>
        <AddTransactionFab />
        <RecurringSync userId={user.id} />
        <BottomNav />
      </div>
    </TransactionDialogProvider>
  );
}
