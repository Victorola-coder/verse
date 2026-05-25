"use client";

import { useCallback, useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";
import QuoteCanvas, { type QuoteCanvasProps } from "@/components/QuoteCanvas";
import { exportAndShareQuote } from "@/utils/export-image";
import { cn } from "@/utils/cn";

interface ExportButtonProps {
  canvasProps: QuoteCanvasProps;
  variant?: "icon" | "button";
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

  const handleExport = useCallback(async () => {
    if (!canvasRef.current || isExporting) {
      return;
    }

    setIsExporting(true);
    setStatus(null);

    try {
      const result = await exportAndShareQuote(canvasRef.current, {
        filename: `verse-${Date.now()}.png`,
      });
      setStatus(result === "shared" ? "Shared" : "Saved");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setStatus("Failed");
      setTimeout(() => setStatus(null), 2000);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting]);

  return (
    <>
      <div
        aria-hidden
        className="fixed top-0 left-0 -z-[1] pointer-events-none"
        style={{ transform: "translateX(-200vw)" }}
      >
        <QuoteCanvas
          ref={canvasRef}
          {...canvasProps}
          exportMode
        />
      </div>

      {variant === "icon" ? (
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          aria-label={label}
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
      ) : (
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className={cn(
            "inline-flex items-center justify-center gap-2 font-sans text-sm",
            "px-5 py-2.5 rounded-full verse-border text-verse-text",
            "transition-all duration-300 ease-verse",
            "hover:border-verse-accent/40 hover:text-verse-accent hover:-translate-y-0.5",
            "disabled:opacity-40 disabled:pointer-events-none",
            className
          )}
        >
          {isExporting ? (
            <span className="h-4 w-4 border border-verse-accent/40 border-t-verse-accent rounded-full animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {status ?? label}
        </button>
      )}
    </>
  );
}
