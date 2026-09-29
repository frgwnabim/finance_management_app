import { Logo } from "@/components/layout/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserCard } from "@/components/layout/user-card";

type SidebarProps = {
  user: { name?: string | null; email?: string | null };
};

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-zinc-200 bg-white md:flex dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav />
      </div>
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <UserCard name={user.name} email={user.email} />
      </div>
    </aside>
  );
}
