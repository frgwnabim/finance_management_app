import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AddTransactionButton } from "@/components/transactions/add-transaction-button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:justify-end md:px-8">
        {/* On desktop the logo lives in the sidebar. */}
        <div className="md:hidden">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          {/* On mobile the floating button opens the same dialog. */}
          <AddTransactionButton className="hidden md:inline-flex" />
          <ThemeToggle />
          {/* On desktop logout lives in the sidebar user card. */}
          <div className="md:hidden">
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
