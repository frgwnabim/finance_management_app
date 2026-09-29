// Pure parsing and validation for CSV transaction import. Used by the
// server actions (the source of truth) and safe to import in the browser.

import type { TransactionType } from "@/lib/generated/prisma/client";
import { MAX_AMOUNT } from "@/lib/validations/transaction";

export const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 5000;
export const MAX_NOTE_LENGTH = 200;

export const IMPORT_FIELDS = {
  date: { label: "Date", required: true },
  type: { label: "Type", required: false },
  category: { label: "Category", required: true },
  amount: { label: "Amount", required: true },
  note: { label: "Note", required: false },
} as const;

export type ImportField = keyof typeof IMPORT_FIELDS;
/** Column index per field, or null when not mapped. */
export type ColumnMapping = Record<ImportField, number | null>;
/** One CSV row after mapping: the raw text for each field. */
export type RawImportRow = Record<ImportField, string>;

const HEADER_ALIASES: Record<ImportField, string[]> = {
  date: ["date", "tanggal", "tgl", "transaction date", "posted"],
  type: ["type", "jenis", "tipe", "kind", "direction"],
  category: ["category", "kategori", "categories"],
  amount: ["amount", "jumlah", "nominal", "value", "total", "harga"],
  note: ["note", "notes", "catatan", "keterangan", "description", "deskripsi", "memo"],
};

/** Suggests a column for each field from the header names. */
export function guessMapping(headers: string[]): ColumnMapping {
  const normalized = headers.map((header) => header.trim().toLowerCase());
  const used = new Set<number>();
  const mapping = {} as ColumnMapping;
  for (const field of Object.keys(IMPORT_FIELDS) as ImportField[]) {
    const index = normalized.findIndex(
      (header, i) => !used.has(i) && HEADER_ALIASES[field].includes(header),
    );
    mapping[field] = index >= 0 ? index : null;
    if (index >= 0) used.add(index);
  }
  return mapping;
}

const pad = (value: number) => String(value).padStart(2, "0");

function toIsoDate(year: number, month: number, day: number) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    year >= 2000 &&
    year <= 2100 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return valid ? `${year}-${pad(month)}-${pad(day)}` : null;
}

/**
 * Accepts 2026-09-29, 2026/09/29 and day-first 29/09/2026, 29-09-2026,
 * 29.09.2026 (1- or 2-digit day and month). Returns "YYYY-MM-DD" or null.
 */
export function parseImportDate(value: string) {
  const text = value.trim();
  let match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(text);
  if (match) return toIsoDate(Number(match[1]), Number(match[2]), Number(match[3]));
  match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text);
  if (match) return toIsoDate(Number(match[3]), Number(match[2]), Number(match[1]));
  return null;
}

/**
 * Accepts 150000, 150.000, Rp 150.000, Rp150.000,00, 150,000, IDR 150000,
 * -150.000 and (150.000). Returns the signed integer, or null.
 * Rupiah has no decimals: a non-zero fraction is rejected.
 */
export function parseImportAmount(value: string): number | null {
  let text = value.trim().replace(/\s+/g, "");
  let negative = false;
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }
  if (text.startsWith("-")) {
    negative = true;
    text = text.slice(1);
  } else if (text.startsWith("+")) {
    text = text.slice(1);
  }
  text = text.replace(/^(rp\.?|idr)/i, "");
  if (text.startsWith("-")) {
    negative = true;
    text = text.slice(1);
  }

  let digits: string;
  if (/^\d+$/.test(text)) {
    digits = text;
  } else if (/^\d{1,3}(\.\d{3})+(,0{1,2})?$/.test(text)) {
    // 150.000 or 150.000,00 (dot thousands, comma decimals)
    digits = text.replace(/,0{1,2}$/, "").replace(/\./g, "");
  } else if (/^\d{1,3}(,\d{3})+(\.0{1,2})?$/.test(text)) {
    // 150,000 or 150,000.00 (comma thousands)
    digits = text.replace(/\.0{1,2}$/, "").replace(/,/g, "");
  } else if (/^\d+[.,]0{1,2}$/.test(text)) {
    // 150000,00 or 150000.00
    digits = text.replace(/[.,]0{1,2}$/, "");
  } else {
    return null;
  }

  const amount = Number(digits);
  return Number.isSafeInteger(amount) ? (negative ? -amount : amount) : null;
}

const TYPE_ALIASES: Record<string, TransactionType> = {
  income: "INCOME",
  in: "INCOME",
  pemasukan: "INCOME",
  masuk: "INCOME",
  credit: "INCOME",
  kredit: "INCOME",
  "+": "INCOME",
  expense: "EXPENSE",
  out: "EXPENSE",
  pengeluaran: "EXPENSE",
  keluar: "EXPENSE",
  debit: "EXPENSE",
  "-": "EXPENSE",
};

export function parseImportType(value: string): TransactionType | null {
  return TYPE_ALIASES[value.trim().toLowerCase()] ?? null;
}

export type NormalizedImportRow = {
  date: string | null;
  type: TransactionType | null;
  category: string;
  amount: number | null;
  note: string | null;
  errors: string[];
};

/**
 * Parses one mapped row. When the type column is unmapped or empty,
 * negative amounts are expenses and others use `defaultType`.
 */
export function normalizeImportRow(
  raw: RawImportRow,
  defaultType: TransactionType,
): NormalizedImportRow {
  const errors: string[] = [];

  const date = parseImportDate(raw.date);
  if (!raw.date.trim()) errors.push("Missing date");
  else if (!date) errors.push(`Invalid date "${raw.date.trim()}"`);

  const signed = parseImportAmount(raw.amount);
  let amount: number | null = null;
  if (!raw.amount.trim()) errors.push("Missing amount");
  else if (signed === null) errors.push(`Invalid amount "${raw.amount.trim()}"`);
  else if (signed === 0) errors.push("Amount must be more than 0");
  else if (Math.abs(signed) > MAX_AMOUNT) errors.push("Amount is too large");
  else amount = Math.abs(signed);

  let type: TransactionType | null;
  if (raw.type.trim()) {
    type = parseImportType(raw.type);
    if (!type) errors.push(`Unknown type "${raw.type.trim()}"`);
  } else {
    type = signed !== null && signed < 0 ? "EXPENSE" : defaultType;
  }

  const category = raw.category.trim().replace(/\s+/g, " ");
  if (!category) errors.push("Missing category");
  else if (category.length > 40) errors.push("Category name is too long (max 40)");

  const note = raw.note.trim() || null;
  if (note && note.length > MAX_NOTE_LENGTH) {
    errors.push(`Note is too long (max ${MAX_NOTE_LENGTH})`);
  }

  return { date, type, category, amount, note, errors };
}

/** Key for duplicate detection: same date, amount and note (case-insensitive). */
export function duplicateKey(date: string, amount: number, note: string | null) {
  return `${date}|${amount}|${(note ?? "").trim().toLowerCase()}`;
}
