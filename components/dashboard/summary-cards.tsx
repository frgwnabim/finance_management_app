import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { StatTile } from "@/components/dashboard/stat-tile";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { formatRupiah } from "@/lib/money";
import { percentChange } from "@/lib/stats";

export async function SummaryCards({ userId, today }: { userId: string; today: string }) {
  const { balance, income, expense } = await getDashboardSummary(userId, today);

  return (
    <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatTile
        label="Current balance"
        value={formatRupiah(balance.current)}
        icon={Wallet}
        change={percentChange(balance.current, balance.previous)}
        upIsGood
        comparison="end of last month"
      />
      <StatTile
        label="Income this month"
        value={formatRupiah(income.current)}
        icon={TrendingUp}
        change={percentChange(income.current, income.previous)}
        upIsGood
        comparison="last month"
      />
      <StatTile
        label="Expenses this month"
        value={formatRupiah(expense.current)}
        icon={TrendingDown}
        change={percentChange(expense.current, expense.previous)}
        upIsGood={false}
        comparison="last month"
      />
    </section>
  );
}
