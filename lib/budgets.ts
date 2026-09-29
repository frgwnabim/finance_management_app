// Budget status thresholds, shared by the Budgets page and the dashboard.

export const BUDGET_WARNING_RATIO = 0.8;

/** normal: under 80% used, warning: 80 to 99%, danger: 100% and above. */
export type BudgetLevel = "normal" | "warning" | "danger";

export function getBudgetRatio(spent: number, amount: number) {
  return amount > 0 ? spent / amount : 0;
}

export function getBudgetLevel(spent: number, amount: number): BudgetLevel {
  const ratio = getBudgetRatio(spent, amount);
  if (ratio >= 1) return "danger";
  if (ratio >= BUDGET_WARNING_RATIO) return "warning";
  return "normal";
}

/** "2026-09" style month key, months 01 to 12. */
export function isMonthKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}
