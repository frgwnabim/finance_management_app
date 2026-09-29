export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <p className="mb-6 text-center text-lg font-semibold text-emerald-600 dark:text-emerald-400">
          Finance Manager
        </p>
        {children}
      </div>
    </main>
  );
}
