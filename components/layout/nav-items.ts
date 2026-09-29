import {
  ArrowLeftRight,
  ChartPie,
  LayoutDashboard,
  PiggyBank,
  Repeat,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  /** Shorter label for the mobile bottom bar, where space is tight. */
  shortLabel?: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", shortLabel: "Home", href: "/app", icon: LayoutDashboard },
  { label: "Transactions", shortLabel: "Activity", href: "/app/transactions", icon: ArrowLeftRight },
  { label: "Analytics", href: "/app/analytics", icon: ChartPie },
  { label: "Budgets", href: "/app/budgets", icon: PiggyBank },
  { label: "Recurring", href: "/app/recurring", icon: Repeat },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

export function isNavItemActive(pathname: string, href: string) {
  // Dashboard is the /app root, so it must match exactly.
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}
