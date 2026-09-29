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

/**
 * Picks the delimiter used in the header line: comma, semicolon (Excel in
 * locales like Indonesian, where comma is the decimal separator) or tab.
 */
function detectDelimiter(text: string) {
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const counts = [",", ";", "\t"].map((delimiter) => {
    let count = 0;
    let inQuotes = false;
    for (const char of firstLine) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === delimiter && !inQuotes) count++;
    }
    return { delimiter, count };
  });
  return counts.sort((a, b) => b.count - a.count)[0].count > 0
    ? counts[0].delimiter
    : ",";
}

/**
 * Parses CSV text per RFC 4180 (quoted fields, doubled quotes, commas and
 * line breaks inside quotes, CRLF or LF). Strips a UTF-8 BOM and skips
 * blank lines.
 */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^﻿/, "");
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const endRow = () => {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
    row = [];
    field = "";
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      endRow();
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length > 0) endRow();
  return rows;
}
