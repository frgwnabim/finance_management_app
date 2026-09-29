const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

/** 1250000 -> "1.250.000" */
export function formatNumber(value: number) {
  return numberFormat.format(value);
}

/** 1250000 -> "Rp 1.250.000", -50000 -> "-Rp 50.000" */
export function formatRupiah(value: number) {
  const formatted = `Rp ${formatNumber(Math.abs(value))}`;
  return value < 0 ? `-${formatted}` : formatted;
}

const compactFormat = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Short form for chart axes: 1500000 -> "Rp 1,5 jt", 250000 -> "Rp 250 rb" */
export function formatRupiahCompact(value: number) {
  return `Rp ${compactFormat.format(value)}`;
}
