"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Modal built on the native <dialog> element: focus trapping, Escape to
 * close and top-layer rendering come from the browser.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      // The panel fills the dialog, so a click on the dialog itself is a backdrop click.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-xl",
        "backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100",
        className,
      )}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="flex items-start justify-between gap-4 p-4 pb-2 sm:p-6 sm:pb-2">
          <div className="flex flex-col gap-1">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm text-zinc-500 dark:text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="-mt-2 -mr-2"
          >
            <X className="size-5" aria-hidden />
          </Button>
        </div>
        {children ? (
          <div className="overflow-y-auto px-4 pt-2 pb-4 sm:px-6 sm:pb-6">{children}</div>
        ) : null}
        {footer ? <DialogFooter className="px-4 pb-4 sm:px-6 sm:pb-6">{footer}</DialogFooter> : null}
      </div>
    </dialog>
  );
}

/** Action row for dialogs. Use inside a form in the dialog body when buttons need form state. */
export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
