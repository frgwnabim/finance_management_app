"use client";

import { Download, Upload } from "lucide-react";
import { useId, useState } from "react";

import { parseCsv } from "@/lib/csv";
import { MAX_IMPORT_FILE_BYTES, MAX_IMPORT_ROWS } from "@/lib/import/transaction-import";
import { cn, pluralize } from "@/lib/utils";

export type ParsedFile = { name: string; headers: string[]; rows: string[][] };

export function UploadStep({ onParsed }: { onParsed: (file: ParsedFile) => void }) {
  const inputId = useId();
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      setError("Choose a .csv file.");
      return;
    }
    if (file.size > MAX_IMPORT_FILE_BYTES) {
      setError("The file is larger than 2MB.");
      return;
    }
    const [headers, ...rows] = parseCsv(await file.text());
    if (!headers || rows.length === 0) {
      setError("The file has no data rows. The first row must contain column names.");
      return;
    }
    if (rows.length > MAX_IMPORT_ROWS) {
      setError(`The file has ${rows.length} rows. Import at most ${MAX_IMPORT_ROWS} at a time.`);
      return;
    }
    onParsed({ name: file.name, headers: headers.map((h) => h.trim()), rows });
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          "focus-within:border-emerald-500",
          isDragging
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
            : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50",
        )}
      >
        <Upload className="size-8 text-zinc-400" aria-hidden />
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          Choose a CSV file or drop it here
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Up to 2MB and {pluralize(MAX_IMPORT_ROWS, "row")}. The first row must contain column names.
        </span>
        <input
          id={inputId}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          data-autofocus
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </label>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Accepted formats</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>Dates: 2026-09-29 or 29/09/2026</li>
          <li>Amounts: 150000, 150.000 or Rp 150.000</li>
          <li>Type: Income or Expense (optional, negative amounts count as expenses)</li>
        </ul>
        <a
          href="/templates/transactions-template.csv"
          download="transactions_template.csv"
          className="mt-3 inline-flex items-center gap-1.5 font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          <Download className="size-4" aria-hidden />
          Download template
        </a>
      </div>
    </div>
  );
}
