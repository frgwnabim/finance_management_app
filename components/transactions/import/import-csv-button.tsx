"use client";

import { CircleCheck, Upload } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { MappingStep, type MappedImport } from "@/components/transactions/import/mapping-step";
import { ReviewStep } from "@/components/transactions/import/review-step";
import { UploadStep, type ParsedFile } from "@/components/transactions/import/upload-step";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import type { ImportResult } from "@/lib/actions/import";
import { cn, pluralize } from "@/lib/utils";

type Step =
  | { name: "upload" }
  | { name: "map"; file: ParsedFile }
  | { name: "review"; file: ParsedFile; mapped: MappedImport }
  | { name: "done"; result: Extract<ImportResult, { ok: true }> };

const STEPS = [
  { name: "upload", label: "Upload" },
  { name: "map", label: "Map columns" },
  { name: "review", label: "Review" },
  { name: "done", label: "Done" },
] as const;

export function ImportCsvButton() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>({ name: "upload" });

  // Each step component remounts when the step changes, so starting over
  // at "upload" resets all wizard state.
  function start() {
    setStep({ name: "upload" });
    setOpen(true);
  }

  const currentIndex = STEPS.findIndex((s) => s.name === step.name);

  return (
    <>
      <Button variant="secondary" onClick={start}>
        <Upload className="size-4" aria-hidden />
        Import CSV
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Import transactions"
        className="max-w-4xl"
      >
        <div className="flex flex-col gap-5">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs" aria-label="Import steps">
            {STEPS.map((s, index) => (
              <li
                key={s.name}
                aria-current={index === currentIndex ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2",
                  index === currentIndex
                    ? "font-semibold text-emerald-700 dark:text-emerald-400"
                    : index < currentIndex
                      ? "text-zinc-700 dark:text-zinc-300"
                      : "text-zinc-400 dark:text-zinc-500",
                )}
              >
                <span className="flex size-5 items-center justify-center rounded-full border border-current tabular-nums">
                  {index + 1}
                </span>
                {s.label}
                {index < STEPS.length - 1 ? <span aria-hidden className="text-zinc-300 dark:text-zinc-600">/</span> : null}
              </li>
            ))}
          </ol>

          {step.name === "upload" ? (
            <UploadStep onParsed={(file) => setStep({ name: "map", file })} />
          ) : null}
          {step.name === "map" ? (
            <MappingStep
              file={step.file}
              onBack={() => setStep({ name: "upload" })}
              onMapped={(mapped) => setStep({ name: "review", file: step.file, mapped })}
            />
          ) : null}
          {step.name === "review" ? (
            <ReviewStep
              mapped={step.mapped}
              onBack={() => setStep({ name: "map", file: step.file })}
              onImported={(result) => setStep({ name: "done", result })}
            />
          ) : null}
          {step.name === "done" ? (
            <DoneStep result={step.result} onClose={() => setOpen(false)} onAgain={start} />
          ) : null}
        </div>
      </Dialog>
    </>
  );
}

function DoneStep({
  result,
  onClose,
  onAgain,
}: {
  result: Extract<ImportResult, { ok: true }>;
  onClose: () => void;
  onAgain: () => void;
}) {
  const { invalid, duplicates, missingCategory } = result.skipped;
  const skippedTotal = invalid + duplicates + missingCategory;
  const details = [
    invalid > 0 && `${invalid} invalid`,
    duplicates > 0 && pluralize(duplicates, "possible duplicate"),
    missingCategory > 0 && `${missingCategory} without a category`,
  ].filter(Boolean);

  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <CircleCheck className="size-12 text-emerald-500" aria-hidden />
      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Imported {pluralize(result.imported, "transaction")}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {skippedTotal > 0 ? `Skipped ${pluralize(skippedTotal, "row")} (${details.join(", ")}).` : "No rows were skipped."}
        {result.categoriesCreated > 0
          ? ` Created ${pluralize(result.categoriesCreated, "new category", "new categories")}.`
          : ""}
      </p>
      <DialogFooter className="w-full">
        <Button variant="secondary" onClick={onAgain}>
          Import another file
        </Button>
        <Link
          href="/app/transactions"
          onClick={onClose}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
        >
          View transactions
        </Link>
      </DialogFooter>
    </div>
  );
}
