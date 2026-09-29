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
