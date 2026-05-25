"use client";

import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import QuoteCanvas, { type QuoteCanvasProps } from "@/components/QuoteCanvas";
import SocialShareMenu from "@/components/SocialShareMenu";
import { exportAndDownloadQuote } from "@/utils/export-image";
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
  void label;
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const openShare = useCallback(() => {
    if (!canvasProps.text.trim()) {
      toast.error("Add quote text first");
      return;
    }
    setShareOpen(true);
  }, [canvasProps.text]);

  const handleDownload = useCallback(async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    const toastId = toast.loading("Generating image…");

    try {
      // Wait a tick so the hidden canvas mounts before we capture it
      await new Promise((r) => setTimeout(r, 50));
      if (!canvasRef.current) {
        throw new Error("Canvas not ready");
      }
      await exportAndDownloadQuote(canvasRef.current, {
        filename: `verse-${Date.now()}.png`,
      });
      toast.success("Saved to your device", { id: toastId });
    } catch {
      toast.error("Could not export image", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }, [isExporting]);

  const exportCanvas =
    isExporting && typeof document !== "undefined"
      ? createPortal(
          <div
            aria-hidden
            className="overflow-hidden pointer-events-none"
            style={{
              position: "fixed",
              width: 1080,
              height: 1350,
              top: 0,
              left: 0,
              opacity: 0,
              zIndex: -1,
              transform: "translate(-200vw, -200vh)",
            }}
          >
            <QuoteCanvas ref={canvasRef} {...canvasProps} exportMode />
          </div>,
          document.body
        )
      : null;

  const shareMenu = (
    <SocialShareMenu
      canvasProps={canvasProps}
      isOpen={shareOpen}
      onClose={() => setShareOpen(false)}
    />
  );

  if (variant === "both") {
    return (
      <>
        {exportCanvas}
        {shareMenu}
        <div className={cn("flex items-center gap-2", className)}>
          <button
            type="button"
            onClick={openShare}
            disabled={isExporting}
            aria-label="Share to socials"
            className={cn(
              "p-2.5 rounded-full verse-border text-verse-muted",
              "transition-all duration-300 ease-verse",
              "hover:text-verse-accent hover:border-verse-accent/30 hover:-translate-y-0.5",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
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
        {shareMenu}
        <button
          type="button"
          onClick={openShare}
          disabled={isExporting}
          aria-label="Share to socials"
          className={cn(
            "p-2.5 rounded-full verse-border text-verse-muted",
            "transition-all duration-300 ease-verse",
            "hover:text-verse-accent hover:border-verse-accent/30 hover:-translate-y-0.5",
            "disabled:opacity-40 disabled:pointer-events-none",
            className
          )}
        >
          <Share2 className="h-4 w-4" />
        </button>
      </>
    );
  }

  return (
    <>
      {exportCanvas}
      {shareMenu}
      <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
        <button
          type="button"
          onClick={openShare}
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
          Share
        </button>
        <button
          type="button"
          onClick={handleDownload}
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
          {isExporting ? "Exporting…" : "Download"}
        </button>
      </div>
    </>
  );
}
