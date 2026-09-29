"use client";

import { useState, useTransition } from "react";

import type { ParsedFile } from "@/components/transactions/import/upload-step";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { previewImport, type ImportPreview } from "@/lib/actions/import";
import type { TransactionType } from "@/lib/generated/prisma/client";
import {
  guessMapping,
  IMPORT_FIELDS,
  type ColumnMapping,
  type ImportField,
  type RawImportRow,
} from "@/lib/import/transaction-import";
import { pluralize } from "@/lib/utils";

export type MappedImport = {
  rawRows: RawImportRow[];
  defaultType: TransactionType;
  preview: Extract<ImportPreview, { ok: true }>;
};

const FIELDS = Object.keys(IMPORT_FIELDS) as ImportField[];

export function MappingStep({
  file,
  onBack,
  onMapped,
}: {
  file: ParsedFile;
  onBack: () => void;
  onMapped: (result: MappedImport) => void;
}) {
  const [mapping, setMapping] = useState<ColumnMapping>(() => guessMapping(file.headers));
  const [defaultType, setDefaultType] = useState<TransactionType>("EXPENSE");
  const [isPending, startTransition] = useTransition();

  const missing = FIELDS.filter((field) => IMPORT_FIELDS[field].required && mapping[field] === null);
  const usedTwice = FIELDS.filter(
    (field) =>
      mapping[field] !== null && FIELDS.some((other) => other !== field && mapping[other] === mapping[field]),
  );
  const problem =
    missing.length > 0
      ? `Map a column to ${missing.map((field) => IMPORT_FIELDS[field].label).join(", ")}.`
      : usedTwice.length > 0
        ? "Each column can only be mapped to one field."
        : null;

  function handleContinue() {
    const rawRows: RawImportRow[] = file.rows.map((cells) => {
      const value = (field: ImportField) => {
        const index = mapping[field];
        return index === null ? "" : (cells[index] ?? "");
      };
      return {
        date: value("date"),
        type: value("type"),
        category: value("category"),
        amount: value("amount"),
        note: value("note"),
      };
    });

    startTransition(async () => {
      const preview = await previewImport({ rows: rawRows, defaultType });
      if (preview.ok) onMapped({ rawRows, defaultType, preview });
      else toast.error(preview.message);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{file.name}</span>:{" "}
        {pluralize(file.rows.length, "row")}. Choose which column holds each field.
      </p>

      <div className="flex flex-col gap-3">
        {FIELDS.map((field) => {
          const index = mapping[field];
          const sample = index === null ? null : file.rows.find((row) => row[index]?.trim())?.[index];
          return (
            <div key={field} className="grid items-center gap-1.5 sm:grid-cols-[8rem_1fr_minmax(0,12rem)] sm:gap-3">
              <Label htmlFor={`map-${field}`}>
                {IMPORT_FIELDS[field].label}
                {IMPORT_FIELDS[field].required ? <span className="text-red-600"> *</span> : null}
              </Label>
              <Select
                id={`map-${field}`}
                value={index === null ? "" : String(index)}
                onChange={(event) =>
                  setMapping((prev) => ({
                    ...prev,
                    [field]: event.target.value === "" ? null : Number(event.target.value),
                  }))
                }
              >
                <option value="">{IMPORT_FIELDS[field].required ? "Choose a column" : "Not in file"}</option>
                {file.headers.map((header, columnIndex) => (
                  <option key={columnIndex} value={columnIndex}>
                    {header || `Column ${columnIndex + 1}`}
                  </option>
                ))}
              </Select>
              <span className="truncate text-xs text-zinc-500 dark:text-zinc-400" title={sample ?? undefined}>
                {sample ? `e.g. ${sample}` : ""}
              </span>
            </div>
          );
        })}
      </div>

      {mapping.type === null ? (
        <div className="grid items-center gap-1.5 rounded-lg bg-zinc-50 p-3 sm:grid-cols-[1fr_12rem] dark:bg-zinc-950">
          <Label htmlFor="map-default-type" className="font-normal text-zinc-600 dark:text-zinc-400">
            No type column: treat rows as (negative amounts are always expenses)
          </Label>
          <Select
            id="map-default-type"
            value={defaultType}
            onChange={(event) => setDefaultType(event.target.value as TransactionType)}
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </Select>
        </div>
      ) : null}

      {problem ? <p className="text-sm text-red-600 dark:text-red-400">{problem}</p> : null}

      <DialogFooter>
        <Button variant="secondary" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={problem !== null} isLoading={isPending}>
          Review rows
        </Button>
      </DialogFooter>
    </div>
  );
}
