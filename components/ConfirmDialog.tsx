"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/utils/cn";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
      if (e.key === "Enter" && !busy) onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onConfirm, onCancel]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby={description ? "confirm-desc" : undefined}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <button
        type="button"
        aria-label="Cancel"
        onClick={busy ? undefined : onCancel}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-sm",
          "bg-verse-card verse-border rounded-t-2xl sm:rounded-2xl",
          "p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6",
          "animate-[slideUp_0.3s_ease-out_forwards]"
        )}
      >
        <h2
          id="confirm-title"
          className="font-serif text-xl text-verse-text mb-2"
        >
          {title}
        </h2>
        {description && (
          <p
            id="confirm-desc"
            className="font-sans text-sm text-verse-muted leading-relaxed mb-5"
          >
            {description}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={cn(
              "font-sans text-sm px-4 py-2.5 rounded-full verse-border",
              "text-verse-muted transition-colors duration-300",
              "hover:text-verse-text",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            autoFocus
            className={cn(
              "font-sans text-sm px-5 py-2.5 rounded-full",
              "transition-all duration-300 active:scale-95",
              destructive
                ? "bg-red-500/90 text-white hover:bg-red-500"
                : "bg-verse-accent text-verse-bg hover:opacity-90",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
