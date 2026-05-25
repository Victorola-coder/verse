"use client";

import { useCallback, useRef, useState } from "react";
import { X } from "lucide-react";
import QuoteCanvas from "@/components/QuoteCanvas";
import ExportButton from "@/components/ExportButton";
import { CATEGORY_LABELS } from "@/lib/quotes-data";
import { THEME_LABELS } from "@/lib/themes";
import { useQuotes } from "@/lib/quote-context";
import {
  DEFAULT_QUOTE_DRAFT,
  type QuoteAlignment,
  type QuoteCategory,
  type QuoteDraft,
  type QuoteTheme,
} from "@/types/quote";
import { cn } from "@/utils/cn";

const THEMES: QuoteTheme[] = ["dark", "beige", "cinematic", "minimal"];
const ALIGNMENTS: QuoteAlignment[] = ["left", "center", "right"];
const CATEGORIES = Object.keys(CATEGORY_LABELS) as Exclude<
  QuoteCategory,
  "all"
>[];

export default function CreateQuoteModal() {
  const { isCreateOpen, closeCreate, addQuote } = useQuotes();
  const [draft, setDraft] = useState<QuoteDraft>(DEFAULT_QUOTE_DRAFT);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateDraft = useCallback(
    <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            updateDraft("backgroundImage", reader.result);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        // ignore read errors
      }
    },
    [updateDraft]
  );

  const handlePublish = useCallback(() => {
    if (!draft.text.trim()) {
      return;
    }

    addQuote(draft);
    setDraft(DEFAULT_QUOTE_DRAFT);
    closeCreate();
  }, [draft, addQuote, closeCreate]);

  const handleClose = useCallback(() => {
    setDraft(DEFAULT_QUOTE_DRAFT);
    closeCreate();
  }, [closeCreate]);

  if (!isCreateOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-quote-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={handleClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-5xl max-h-[95vh] overflow-y-auto",
          "bg-verse-card verse-border rounded-t-2xl sm:rounded-2xl",
          "animate-[slideUp_0.4s_ease-out_forwards]"
        )}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-verse-card/95 backdrop-blur-md border-b border-verse">
          <h2
            id="create-quote-title"
            className="font-serif text-2xl text-verse-text"
          >
            Create Quote
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full verse-border text-verse-muted transition-colors duration-300 hover:text-verse-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0">
          <div className="p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-verse">
            <div>
              <label className="font-sans text-xs text-verse-muted tracking-widest uppercase mb-2 block">
                Quote
              </label>
              <textarea
                value={draft.text}
                onChange={(e) => updateDraft("text", e.target.value)}
                placeholder="Write something that moves you..."
                rows={5}
                className={cn(
                  "w-full bg-verse-bg verse-border rounded-xl px-4 py-3",
                  "font-serif text-lg text-verse-text placeholder:text-verse-muted/50",
                  "resize-none outline-none transition-colors duration-300",
                  "focus:border-verse-accent/30"
                )}
              />
            </div>

            <div>
              <label className="font-sans text-xs text-verse-muted tracking-widest uppercase mb-2 block">
                Author
              </label>
              <input
                type="text"
                value={draft.author}
                onChange={(e) => updateDraft("author", e.target.value)}
                placeholder="Your name or a muse"
                className={cn(
                  "w-full bg-verse-bg verse-border rounded-xl px-4 py-3",
                  "font-sans text-sm text-verse-text placeholder:text-verse-muted/50",
                  "outline-none transition-colors duration-300",
                  "focus:border-verse-accent/30"
                )}
              />
            </div>

            <div>
              <label className="font-sans text-xs text-verse-muted tracking-widest uppercase mb-2 block">
                Background Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-sans text-xs px-4 py-2 rounded-full verse-border text-verse-muted transition-all duration-300 hover:text-verse-text hover:-translate-y-0.5"
                >
                  Upload
                </button>
                {draft.backgroundImage && (
                  <button
                    type="button"
                    onClick={() => updateDraft("backgroundImage", undefined)}
                    className="font-sans text-xs px-4 py-2 rounded-full text-verse-muted transition-colors duration-300 hover:text-verse-accent"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="font-sans text-xs text-verse-muted tracking-widest uppercase mb-3 block">
                Alignment
              </label>
              <div className="flex gap-2">
                {ALIGNMENTS.map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateDraft("alignment", align)}
                    className={cn(
                      "flex-1 font-sans text-xs capitalize py-2 rounded-full verse-border transition-all duration-300",
                      draft.alignment === align
                        ? "bg-verse-accent/20 text-verse-accent border-verse-accent/30"
                        : "text-verse-muted hover:text-verse-text"
                    )}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-sans text-xs text-verse-muted tracking-widest uppercase mb-3 block">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => updateDraft("theme", theme)}
                    className={cn(
                      "font-sans text-xs py-2.5 rounded-full verse-border transition-all duration-300",
                      draft.theme === theme
                        ? "bg-verse-accent/20 text-verse-accent border-verse-accent/30"
                        : "text-verse-muted hover:text-verse-text"
                    )}
                  >
                    {THEME_LABELS[theme]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-sans text-xs text-verse-muted tracking-widest uppercase mb-3 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateDraft("category", cat)}
                    className={cn(
                      "font-sans text-xs px-3 py-1.5 rounded-full verse-border transition-all duration-300",
                      draft.category === cat
                        ? "bg-verse-accent/20 text-verse-accent border-verse-accent/30"
                        : "text-verse-muted hover:text-verse-text"
                    )}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handlePublish}
                disabled={!draft.text.trim()}
                className={cn(
                  "flex-1 font-sans text-sm py-3 rounded-full",
                  "bg-verse-accent text-verse-bg",
                  "transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5",
                  "disabled:opacity-40 disabled:pointer-events-none"
                )}
              >
                Publish to Feed
              </button>
              <ExportButton
                variant="button"
                label="Export Image"
                canvasProps={{
                  text: draft.text,
                  author: draft.author,
                  theme: draft.theme,
                  alignment: draft.alignment,
                  backgroundImage: draft.backgroundImage,
                }}
              />
            </div>
          </div>

          <div className="p-6 bg-verse-bg/50">
            <p className="font-sans text-xs text-verse-muted tracking-widest uppercase mb-4 text-center">
              Live Preview
            </p>
            <QuoteCanvas
              text={draft.text}
              author={draft.author}
              theme={draft.theme}
              alignment={draft.alignment}
              backgroundImage={draft.backgroundImage}
              className="rounded-xl verse-border"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
