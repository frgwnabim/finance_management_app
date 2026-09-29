"use client";

import { useState, useTransition } from "react";

import type { MappedImport } from "@/components/transactions/import/mapping-step";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { toast } from "@/components/ui/toast";
import { importTransactions, type ImportResult, type PreviewRow } from "@/lib/actions/import";
import { TRANSACTION_TYPE_LABELS } from "@/lib/categories";
import { formatRupiah } from "@/lib/money";
import { cn, pluralize } from "@/lib/utils";

const MAX_RENDERED_ROWS = 500;
const newCategoryKey = (type: string, name: string) => `${type}|${name.toLowerCase()}`;

type RowStatus = "valid" | "invalid" | "duplicate" | "missing-category";

export function ReviewStep({
  mapped,
  onBack,
  onImported,
}: {
  mapped: MappedImport;
  onBack: () => void;
  onImported: (result: Extract<ImportResult, { ok: true }>) => void;
}) {
  const { rows, newCategories } = mapped.preview;
  const [createKeys, setCreateKeys] = useState(
    () => new Set(newCategories.map((c) => newCategoryKey(c.type, c.name))),
  );
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [view, setView] = useState<"all" | "problems">("all");
  const [isPending, startTransition] = useTransition();

  // Mirrors the server's rules so the counts match what will be imported.
  function statusOf(row: PreviewRow): RowStatus {
    if (row.errors.length > 0) return "invalid";
    if (row.duplicate && skipDuplicates) return "duplicate";
    if (row.isNewCategory && !createKeys.has(newCategoryKey(row.type!, row.category))) {
      return "missing-category";
    }
    return "valid";
  }

  const statuses = rows.map(statusOf);
  const count = (status: RowStatus) => statuses.filter((s) => s === status).length;
  const toImport = count("valid");
  const duplicates = rows.filter((row) => row.errors.length === 0 && row.duplicate).length;
  const visible = rows
    .map((row, index) => ({ row, status: statuses[index] }))
    .filter(({ row, status }) => view === "all" || status !== "valid" || row.duplicate);

  function toggleCategory(key: string) {
    setCreateKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleImport() {
    startTransition(async () => {
      const result = await importTransactions({
        rows: mapped.rawRows,
        defaultType: mapped.defaultType,
        createCategories: newCategories.filter((c) => createKeys.has(newCategoryKey(c.type, c.name))),
        skipDuplicates,
      });
      if (result.ok) {
        toast.success(`Imported ${pluralize(result.imported, "transaction")}.`);
        onImported(result);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge variant="success">{count("valid")} ready to import</Badge>
        {count("invalid") > 0 ? <Badge variant="danger">{count("invalid")} invalid</Badge> : null}
        {duplicates > 0 ? <Badge variant="warning">{pluralize(duplicates, "possible duplicate")}</Badge> : null}
        {newCategories.length > 0 ? (
          <Badge variant="info">{pluralize(newCategories.length, "new category", "new categories")}</Badge>
        ) : null}
      </div>

      {newCategories.length > 0 ? (
        <fieldset className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <legend className="px-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Create missing categories automatically
          </legend>
          <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
            Unchecked categories aren&apos;t created, and their rows are skipped.
          </p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {newCategories.map((category) => {
              const key = newCategoryKey(category.type, category.name);
              return (
                <li key={key}>
                  <label className="flex items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <input
                      type="checkbox"
                      checked={createKeys.has(key)}
                      onChange={() => toggleCategory(key)}
                      className="size-4 accent-emerald-600"
                    />
                    <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{category.name}</span>
                    <Badge variant={category.type === "INCOME" ? "success" : "neutral"}>
                      {TRANSACTION_TYPE_LABELS[category.type]}
                    </Badge>
                    <span className="ml-auto text-xs text-zinc-500">{pluralize(category.rows, "row")}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}

      {duplicates > 0 ? (
        <label className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          <input
            type="checkbox"
            checked={skipDuplicates}
            onChange={(event) => setSkipDuplicates(event.target.checked)}
            className="mt-0.5 size-4 accent-amber-600"
          />
          <span>
            Skip {pluralize(duplicates, "possible duplicate")} (same date, amount and note as an existing
            transaction or an earlier row in this file)
          </span>
        </label>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <SegmentedControl
          options={[
            { value: "all", label: `All rows (${rows.length})` },
            { value: "problems", label: "Problems only" },
          ]}
          value={view}
          onChange={setView}
          aria-label="Rows to show"
          className="w-full max-w-sm text-xs"
        />
      </div>

      {/* Phones: compact cards. Larger screens: the table below. */}
      <ul className="max-h-96 divide-y divide-zinc-100 overflow-auto rounded-xl border border-zinc-200 sm:hidden dark:divide-zinc-800 dark:border-zinc-800">
        {visible.slice(0, MAX_RENDERED_ROWS).map(({ row, status }) => (
          <li key={row.line} className={cn("px-3 py-2 text-sm", rowTint(row, status))}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 font-medium">
                <span className="truncate">{row.category || "No category"}</span>
                {row.isNewCategory && status !== "invalid" ? <Badge variant="info" className="px-1.5 py-0 text-[11px]">New</Badge> : null}
              </span>
              <span className="shrink-0 tabular-nums">{row.amount !== null ? formatRupiah(row.amount) : ""}</span>
            </div>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {[`Line ${row.line}`, row.date, row.type ? TRANSACTION_TYPE_LABELS[row.type] : null, row.note]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-0.5 text-xs">
              <RowStatusLabel row={row} status={status} />
            </p>
          </li>
        ))}
        {visible.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-zinc-500">No problems found. Every row is valid.</li>
        ) : null}
      </ul>

      <div className="hidden max-h-80 overflow-auto rounded-xl border border-zinc-200 sm:block dark:border-zinc-800">
        <table className="w-full min-w-[44rem] text-sm">
          <thead className="sticky top-0 bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Line</th>
              <th scope="col" className="px-3 py-2 font-medium">Date</th>
              <th scope="col" className="px-3 py-2 font-medium">Type</th>
              <th scope="col" className="px-3 py-2 font-medium">Category</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Amount</th>
              <th scope="col" className="px-3 py-2 font-medium">Note</th>
              <th scope="col" className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {visible.slice(0, MAX_RENDERED_ROWS).map(({ row, status }) => (
              <tr key={row.line} className={rowTint(row, status)}>
                <td className="px-3 py-2 text-zinc-500 tabular-nums">{row.line}</td>
                <td className="px-3 py-2 whitespace-nowrap">{row.date ?? ""}</td>
                <td className="px-3 py-2">{row.type ? TRANSACTION_TYPE_LABELS[row.type] : ""}</td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    <span className="max-w-32 truncate">{row.category}</span>
                    {row.isNewCategory && status !== "invalid" ? <Badge variant="info" className="px-1.5 py-0 text-[11px]">New</Badge> : null}
                  </span>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">
                  {row.amount !== null ? formatRupiah(row.amount) : ""}
                </td>
                <td className="max-w-40 truncate px-3 py-2 text-zinc-600 dark:text-zinc-400" title={row.note ?? undefined}>
                  {row.note}
                </td>
                <td className="px-3 py-2 text-xs">
                  <RowStatusLabel row={row} status={status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-zinc-500">No problems found. Every row is valid.</p>
        ) : null}
      </div>
      {visible.length > MAX_RENDERED_ROWS ? (
        <p className="text-xs text-zinc-500">
          Showing the first {MAX_RENDERED_ROWS} of {visible.length} rows. All rows are imported.
        </p>
      ) : null}

      <DialogFooter>
        <Button variant="secondary" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button onClick={handleImport} disabled={toImport === 0} isLoading={isPending}>
          Import {pluralize(toImport, "transaction")}
        </Button>
      </DialogFooter>
    </div>
  );
}

function rowTint(row: PreviewRow, status: RowStatus) {
  if (status === "invalid" || status === "missing-category") return "bg-red-50 dark:bg-red-950/30";
  if (row.duplicate) return "bg-amber-50 dark:bg-amber-950/30";
  return undefined;
}

function RowStatusLabel({ row, status }: { row: PreviewRow; status: RowStatus }) {
  if (status === "invalid") {
    return <span className="font-medium text-red-700 dark:text-red-300">{row.errors.join(". ")}</span>;
  }
  if (status === "missing-category") {
    return <span className="font-medium text-red-700 dark:text-red-300">Category not created, skipped</span>;
  }
  const duplicateText =
    row.duplicate === "existing"
      ? "Possible duplicate of an existing transaction"
      : row.duplicate === "file"
        ? "Repeats an earlier row"
        : null;
  if (duplicateText) {
    return (
      <span className="font-medium text-amber-800 dark:text-amber-300">
        {duplicateText}
        {status === "duplicate" ? ", skipped" : ", will be imported"}
      </span>
    );
  }
  return <span className="text-emerald-700 dark:text-emerald-400">Ready</span>;
}
