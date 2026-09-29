import { formatRupiah } from "@/lib/money";
import { cn, pluralize } from "@/lib/utils";

type TransactionSummaryProps = {
  income: number;
  expense: number;
  net: number;
  count: number;
};

export function TransactionSummary({ income, expense, net, count }: TransactionSummaryProps) {
  return (
    <section aria-label="Summary for current filters" className="mb-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat
          label="Income"
          value={formatRupiah(income)}
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          label="Expense"
          value={formatRupiah(expense)}
          valueClassName="text-red-600 dark:text-red-400"
        />
        <Stat
          label="Net"
          value={`${net > 0 ? "+" : ""}${formatRupiah(net)}`}
          valueClassName={
            net < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-zinc-50"
          }
          className="col-span-2 sm:col-span-1"
        />
      </dl>
      <p className="mt-2 px-1 text-xs text-zinc-500 dark:text-zinc-400">
        {pluralize(count, "transaction")} match the current filters
      </p>
    </section>
  );
}

type StatProps = {
  label: string;
  value: string;
  valueClassName?: string;
  className?: string;
};

function Stat({ label, value, valueClassName, className }: StatProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd
        className={cn(
          "mt-1 truncate text-base font-semibold tabular-nums sm:text-lg",
          valueClassName,
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
