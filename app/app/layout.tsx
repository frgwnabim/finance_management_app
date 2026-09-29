import { LogoutButton } from "@/components/auth/logout-button";
import { requireUser } from "@/lib/session";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  // proxy.ts already guards /app; this also gives Server Components the user.
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Finance Manager
          </span>
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-zinc-600 sm:inline dark:text-zinc-400">
              {user.name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
