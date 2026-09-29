import { LogoutButton } from "@/components/auth/logout-button";

type UserCardProps = {
  name?: string | null;
  email?: string | null;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserCard({ name, email }: UserCardProps) {
  const displayName = name || email || "Account";

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      >
        {getInitials(displayName)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {displayName}
        </p>
        {email ? (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
        ) : null}
      </div>
      <LogoutButton />
    </div>
  );
}
