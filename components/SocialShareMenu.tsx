"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import QuoteCanvas, { type QuoteCanvasProps } from "@/components/QuoteCanvas";
import {
  downloadBlob,
  generateQuoteImage,
  shareQuoteImage,
} from "@/utils/export-image";
import {
  buildShareCaption,
  getSocialShareLinks,
  type SocialShareLink,
} from "@/utils/social-share";
import { cn } from "@/utils/cn";

interface SocialShareMenuProps {
  canvasProps: QuoteCanvasProps;
  isOpen: boolean;
  onClose: () => void;
}

export default function SocialShareMenu({
  canvasProps,
  isOpen,
  onClose,
}: SocialShareMenuProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const caption = buildShareCaption(canvasProps);
  const links = getSocialShareLinks(caption);

  useEffect(() => {
    if (!isOpen) {
      setImageBlob(null);
      setStatus(null);
      return;
    }

    const generate = async () => {
      if (!canvasRef.current) {
        return;
      }

      setIsGenerating(true);
      try {
        const blob = await generateQuoteImage(canvasRef.current);
        setImageBlob(blob);
      } catch {
        setStatus("Could not prepare image");
      } finally {
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(() => {
      void generate();
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, canvasProps]);

  const handleAction = useCallback(
    async (link: SocialShareLink) => {
      try {
        if (link.action === "copy") {
          await navigator.clipboard.writeText(caption);
          setStatus("Caption copied");
        } else if (link.action === "download") {
          if (!imageBlob) {
            setStatus("Image not ready yet");
            return;
          }
          downloadBlob(imageBlob, `verse-${Date.now()}.png`);
          setStatus("Image saved — open Instagram or TikTok to post");
        } else if (link.action === "native") {
          if (!imageBlob) {
            setStatus("Image not ready yet");
            return;
          }
          const result = await shareQuoteImage(
            imageBlob,
            `verse-${Date.now()}.png`
          );
          if (result === "shared") {
            setStatus("Shared");
          } else if (result === "cancelled") {
            setStatus(null);
          } else {
            downloadBlob(imageBlob, `verse-${Date.now()}.png`);
            setStatus("Downloaded — share image manually");
          }
        }
        setTimeout(() => setStatus(null), 2800);
      } catch {
        setStatus("Something went wrong");
        setTimeout(() => setStatus(null), 2500);
      }
    },
    [caption, imageBlob]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-quote-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto",
          "bg-verse-card verse-border rounded-t-2xl sm:rounded-2xl p-6",
          "animate-[slideUp_0.35s_ease-out_forwards]"
        )}
      >
        <div
          aria-hidden
          className="fixed left-0 top-0 overflow-hidden pointer-events-none"
          style={{ width: 1080, height: 1350, opacity: 0, zIndex: -1 }}
        >
          <QuoteCanvas ref={canvasRef} {...canvasProps} exportMode />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2
            id="share-quote-title"
            className="font-serif text-xl text-verse-text"
          >
            Share to socials
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full verse-border text-verse-muted hover:text-verse-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="font-sans text-xs text-verse-muted mb-4 leading-relaxed">
          {isGenerating
            ? "Preparing your quote image…"
            : "Text platforms open with your caption. For Instagram or TikTok, download the image first."}
        </p>

        {status && (
          <p className="font-sans text-xs text-verse-accent mb-4">{status}</p>
        )}

        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              {link.href ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "block w-full text-left px-4 py-3 rounded-xl verse-border",
                    "font-sans text-sm text-verse-text",
                    "transition-all duration-300 hover:border-verse-accent/40 hover:-translate-y-0.5"
                  )}
                >
                  <span className="block">{link.label}</span>
                  {link.hint && (
                    <span className="block text-[10px] text-verse-muted mt-1">
                      {link.hint}
                    </span>
                  )}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction(link)}
                  disabled={isGenerating && link.action !== "copy"}
                  className={cn(
                    "block w-full text-left px-4 py-3 rounded-xl verse-border",
                    "font-sans text-sm text-verse-text",
                    "transition-all duration-300 hover:border-verse-accent/40 hover:-translate-y-0.5",
                    "disabled:opacity-40"
                  )}
                >
                  <span className="block">{link.label}</span>
                  {link.hint && (
                    <span className="block text-[10px] text-verse-muted mt-1">
                      {link.hint}
                    </span>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
