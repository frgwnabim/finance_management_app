// CSV writing per RFC 4180: CRLF line endings, fields containing a comma,
// quote, CR or LF are wrapped in quotes with inner quotes doubled.

export type CsvValue = string | number | null | undefined;

// Spreadsheet apps run cells starting with these as formulas
// ("CSV injection"); such text cells get a leading apostrophe.
const FORMULA_START = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: CsvValue, { isText = true } = {}) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (isText && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** One CSV line (with trailing CRLF). Numbers are written as-is. */
export function toCsvRow(values: CsvValue[]) {
  return `${values.map((value) => escapeCsvCell(value, { isText: typeof value !== "number" })).join(",")}\r\n`;
}

/** Byte order mark so Excel opens the file as UTF-8. */
export const CSV_BOM = "﻿";
