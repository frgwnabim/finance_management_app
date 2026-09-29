/**
 * Percentage change from `previous` to `current`, or null when there is no
 * baseline (previous is 0 but current isn't).
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** 12.345 -> "+12.3%", -4 -> "-4%", 0 -> "0%" */
export function formatPercent(value: number) {
  const rounded = Math.round(value * 10) / 10;
  const text = `${Math.abs(rounded).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
  if (rounded > 0) return `+${text}`;
  if (rounded < 0) return `-${text}`;
  return text;
}
