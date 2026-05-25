"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Share2,
  Twitter,
  X,
} from "lucide-react";
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

const PLATFORM_META: Record<
  string,
  { Icon: typeof Share2; color: string; short: string }
> = {
  x: { Icon: Twitter, color: "text-[#e7e9ea]", short: "X" },
  whatsapp: { Icon: MessageCircle, color: "text-[#25D366]", short: "WhatsApp" },
  facebook: { Icon: Facebook, color: "text-[#1877F2]", short: "Facebook" },
  linkedin: { Icon: Linkedin, color: "text-[#0A66C2]", short: "LinkedIn" },
  copy: { Icon: Copy, color: "text-verse-text", short: "Copy" },
  instagram: { Icon: Instagram, color: "text-[#E1306C]", short: "IG / TikTok" },
  native: { Icon: Share2, color: "text-verse-accent", short: "More" },
};

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

  const linkButtonClasses = cn(
    "group flex flex-col items-center justify-center gap-2 px-2 py-4 rounded-2xl verse-border",
    "font-sans text-xs text-verse-text bg-verse-bg/40",
    "transition-all duration-300 hover:border-verse-accent/40 hover:-translate-y-0.5 hover:bg-verse-bg/70",
    "disabled:opacity-40 disabled:pointer-events-none"
  );

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
          "bg-verse-card verse-border rounded-t-2xl sm:rounded-2xl",
          "p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6",
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

        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2
            id="share-quote-title"
            className="font-serif text-lg sm:text-xl text-verse-text"
          >
            Share to socials
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full verse-border text-verse-muted hover:text-verse-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="font-sans text-[11px] sm:text-xs text-verse-muted mb-4 leading-relaxed">
          {isGenerating
            ? "Preparing your quote image…"
            : "Text platforms open with your caption. For Instagram or TikTok, download the image first."}
        </p>

        {status && (
          <p className="font-sans text-xs text-verse-accent mb-3">{status}</p>
        )}

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
          {links.map((link) => {
            const meta = PLATFORM_META[link.id] ?? {
              Icon: Share2,
              color: "text-verse-text",
              short: link.label,
            };
            const { Icon, color, short } = meta;
            const isBusy = isGenerating && link.action !== "copy";

            const inner = (
              <>
                <span
                  className={cn(
                    "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-verse-card verse-border transition-transform duration-300 group-hover:scale-105",
                    color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] sm:text-xs text-verse-text leading-tight text-center">
                  {short}
                </span>
              </>
            );

            if (link.href) {
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className={linkButtonClasses}
                >
                  {inner}
                </a>
              );
            }

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleAction(link)}
                disabled={isBusy}
                aria-label={link.label}
                className={linkButtonClasses}
              >
                {inner}
              </button>
            );
          })}
        </div>

        <p className="font-sans text-[10px] text-verse-muted/70 mt-4 leading-relaxed">
          Tap Instagram / TikTok to download the image, then paste the caption
          via Copy.
        </p>
      </div>
    </div>
  );
}
