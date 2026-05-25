"use client";

import { useCallback, useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";
import QuoteCanvas, { type QuoteCanvasProps } from "@/components/QuoteCanvas";
import {
  exportAndDownloadQuote,
  exportAndShareQuote,
} from "@/utils/export-image";
import { cn } from "@/utils/cn";

interface ExportButtonProps {
  canvasProps: QuoteCanvasProps;
  variant?: "icon" | "button" | "both";
  className?: string;
  label?: string;
}

export default function ExportButton({
  canvasProps,
  variant = "icon",
  className,
  label = "Export",
}: ExportButtonProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const runExport = useCallback(
    async (mode: "share" | "download") => {
      if (!canvasRef.current || isExporting) {
        return;
      }

      if (!canvasProps.text.trim() && mode === "share") {
        setStatus("Add quote text first");
        setTimeout(() => setStatus(null), 2000);
        return;
      }

      setIsExporting(true);
      setStatus(null);

      try {
        if (mode === "download") {
          await exportAndDownloadQuote(canvasRef.current, {
            filename: `verse-${Date.now()}.png`,
          });
          setStatus("Saved");
        } else {
          const result = await exportAndShareQuote(canvasRef.current, {
            filename: `verse-${Date.now()}.png`,
          });
          if (result === "shared") {
            setStatus("Shared");
          } else if (result === "cancelled") {
            setStatus(null);
          } else {
            setStatus("Saved");
          }
        }
        setTimeout(() => setStatus(null), 2000);
      } catch {
        setStatus("Failed");
        setTimeout(() => setStatus(null), 2500);
      } finally {
        setIsExporting(false);
      }
    },
    [canvasProps.text, isExporting]
  );

  const exportCanvas = (
    <div
      aria-hidden
      className="fixed left-0 top-0 overflow-hidden pointer-events-none"
      style={{
        width: 1080,
        height: 1350,
        opacity: 0,
        zIndex: -1,
      }}
    >
      <QuoteCanvas ref={canvasRef} {...canvasProps} exportMode />
    </div>
  );

  if (variant === "both") {
    return (
      <>
        {exportCanvas}
        <div className={cn("flex items-center gap-2", className)}>
          <button
            type="button"
            onClick={() => runExport("share")}
            disabled={isExporting}
            aria-label="Share quote"
            className={cn(
              "p-2.5 rounded-full verse-border text-verse-muted",
              "transition-all duration-300 ease-verse",
              "hover:text-verse-accent hover:border-verse-accent/30 hover:-translate-y-0.5",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            {isExporting ? (
              <span className="block h-4 w-4 border border-verse-accent/40 border-t-verse-accent rounded-full animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => runExport("download")}
            disabled={isExporting}
            aria-label="Download quote"
            className={cn(
              "p-2.5 rounded-full verse-border text-verse-muted",
              "transition-all duration-300 ease-verse",
              "hover:text-verse-accent hover:border-verse-accent/30 hover:-translate-y-0.5",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </>
    );
  }

  if (variant === "icon") {
    return (
      <>
        {exportCanvas}
        <button
          type="button"
          onClick={() => runExport("share")}
          disabled={isExporting}
          aria-label="Share quote"
          className={cn(
            "p-2.5 rounded-full verse-border text-verse-muted",
            "transition-all duration-300 ease-verse",
            "hover:text-verse-accent hover:border-verse-accent/30 hover:-translate-y-0.5",
            "disabled:opacity-40 disabled:pointer-events-none",
            className
          )}
        >
          {isExporting ? (
            <span className="block h-4 w-4 border border-verse-accent/40 border-t-verse-accent rounded-full animate-spin" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </button>
      </>
    );
  }

  return (
    <>
      {exportCanvas}
      <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
        <button
          type="button"
          onClick={() => runExport("share")}
          disabled={isExporting}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 font-sans text-sm",
            "px-5 py-2.5 rounded-full verse-border text-verse-text",
            "transition-all duration-300 ease-verse",
            "hover:border-verse-accent/40 hover:text-verse-accent hover:-translate-y-0.5",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          <Share2 className="h-4 w-4" />
          {status === "Shared" ? "Shared" : "Share"}
        </button>
        <button
          type="button"
          onClick={() => runExport("download")}
          disabled={isExporting}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 font-sans text-sm",
            "px-5 py-2.5 rounded-full bg-verse-accent text-verse-bg",
            "transition-all duration-300 ease-verse",
            "hover:opacity-90 hover:-translate-y-0.5",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          {isExporting ? (
            <span className="h-4 w-4 border border-verse-bg/40 border-t-verse-bg rounded-full animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {status === "Saved" ? "Saved" : "Download"}
        </button>
      </div>
    </>
  );
}
