"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import QuoteCanvas from "@/components/QuoteCanvas";
import ExportButton from "@/components/ExportButton";
import { CATEGORY_LABELS } from "@/lib/quotes-data";
import { THEME_LABELS } from "@/lib/themes";
import {
  draftToForm,
  uploadQuoteImage,
  useDeleteDraftMutation,
  useDraftQuery,
  useDraftsQuery,
  useSaveDraftMutation,
} from "@/lib/hooks/use-drafts";
import { useCreateQuoteMutation } from "@/lib/hooks/use-quotes";
import { useVerseStore } from "@/lib/store/verse";
import {
  AUTHOR_CASING_LABELS,
  DEFAULT_QUOTE_DRAFT,
  type AuthorCasing,
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
const AUTHOR_CASINGS = Object.keys(AUTHOR_CASING_LABELS) as AuthorCasing[];

export default function CreateQuoteModal() {
  const { isCreateOpen, closeCreate, activeDraftId, setActiveDraftId } =
    useVerseStore();
  const [draft, setDraft] = useState<QuoteDraft>(DEFAULT_QUOTE_DRAFT);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: drafts = [] } = useDraftsQuery(isCreateOpen);
  const { data: loadedDraft } = useDraftQuery(activeDraftId);
  const saveDraftMutation = useSaveDraftMutation();
  const deleteDraftMutation = useDeleteDraftMutation();
  const createQuoteMutation = useCreateQuoteMutation();

  useEffect(() => {
    if (loadedDraft) {
      setDraft(draftToForm(loadedDraft));
    }
  }, [loadedDraft]);

  useEffect(() => {
    if (isCreateOpen && !activeDraftId) {
      setDraft(DEFAULT_QUOTE_DRAFT);
    }
  }, [isCreateOpen, activeDraftId]);

  const updateDraft = useCallback(
    <K extends keyof QuoteDraft>(key: K, value: QuoteDraft[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const draftSignature = useMemo(
    () =>
      JSON.stringify({
        text: draft.text,
        author: draft.author,
        category: draft.category,
        theme: draft.theme,
        alignment: draft.alignment,
        backgroundImage: draft.backgroundImage ?? null,
        showQuoteMarks: draft.showQuoteMarks,
        authorCasing: draft.authorCasing,
      }),
    [draft]
  );
  const lastSavedSignatureRef = useRef<string>(draftSignature);

  useEffect(() => {
    lastSavedSignatureRef.current = draftSignature;
  }, [activeDraftId]);

  useEffect(() => {
    if (!isCreateOpen) {
      return;
    }
    if (draft.text.trim().length < 10) {
      return;
    }
    if (draftSignature === lastSavedSignatureRef.current) {
      return;
    }

    const handle = setTimeout(async () => {
      try {
        const saved = await saveDraftMutation.mutateAsync(draft);
        lastSavedSignatureRef.current = draftSignature;
        if (!activeDraftId) {
          setActiveDraftId(saved.id);
          setDraft((prev) => ({ ...prev, id: saved.id }));
        }
      } catch {
        // silent — user can still hit the manual button
      }
    }, 1500);

    return () => clearTimeout(handle);
  }, [
    draftSignature,
    draft,
    isCreateOpen,
    saveDraftMutation,
    activeDraftId,
    setActiveDraftId,
  ]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      setIsUploading(true);
      const toastId = toast.loading("Uploading image…");
      try {
        const url = await uploadQuoteImage(file);
        updateDraft("backgroundImage", url);
        toast.success("Image uploaded", { id: toastId });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(message, { id: toastId });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [updateDraft]
  );

  const handleSaveDraft = useCallback(async () => {
    const toastId = toast.loading("Saving draft…");
    try {
      const saved = await saveDraftMutation.mutateAsync(draft);
      setDraft(draftToForm(saved));
      setActiveDraftId(saved.id);
      toast.success("Draft saved", { id: toastId });
    } catch {
      toast.error("Could not save draft", { id: toastId });
    }
  }, [draft, saveDraftMutation, setActiveDraftId]);

  const fireConfetti = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      return;
    }
    const defaults = {
      spread: 70,
      ticks: 90,
      gravity: 0.9,
      decay: 0.92,
      startVelocity: 35,
      colors: ["#D6B98C", "#F5F1EA", "#9D9D9D"],
    };
    confetti({ ...defaults, particleCount: 60, origin: { x: 0.2, y: 0.4 } });
    confetti({ ...defaults, particleCount: 60, origin: { x: 0.8, y: 0.4 } });
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 80,
        origin: { x: 0.5, y: 0.5 },
      });
    }, 180);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!draft.text.trim()) {
      toast.error("Quote text is required");
      return;
    }

    const toastId = toast.loading("Publishing…");
    try {
      await createQuoteMutation.mutateAsync(draft);
      toast.success("Quote published", { id: toastId });
      fireConfetti();
      setDraft(DEFAULT_QUOTE_DRAFT);
      setActiveDraftId(null);
      closeCreate();
    } catch {
      toast.error("Could not publish quote", { id: toastId });
    }
  }, [draft, createQuoteMutation, closeCreate, setActiveDraftId, fireConfetti]);

  const handleClose = useCallback(() => {
    setDraft(DEFAULT_QUOTE_DRAFT);
    setActiveDraftId(null);
    closeCreate();
  }, [closeCreate, setActiveDraftId]);

  const handleLoadDraft = useCallback(
    (id: string) => {
      setActiveDraftId(id);
    },
    [setActiveDraftId]
  );

  const handleDeleteDraft = useCallback(
    async (id: string) => {
      try {
        await deleteDraftMutation.mutateAsync(id);
        if (activeDraftId === id) {
          setDraft(DEFAULT_QUOTE_DRAFT);
          setActiveDraftId(null);
        }
        toast.success("Draft deleted");
      } catch {
        toast.error("Could not delete draft");
      }
    },
    [deleteDraftMutation, activeDraftId, setActiveDraftId]
  );

  if (!isCreateOpen) {
    return null;
  }

  const isSaving =
    saveDraftMutation.isPending ||
    createQuoteMutation.isPending ||
    isUploading;

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
          "relative z-10 w-full max-w-5xl flex flex-col",
          "h-[100dvh] sm:h-auto sm:max-h-[92vh]",
          "bg-verse-card verse-border rounded-t-2xl sm:rounded-2xl overflow-hidden",
          "animate-[slideUp_0.4s_ease-out_forwards]"
        )}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-verse-card/95 backdrop-blur-md border-b border-verse shrink-0">
          <h2
            id="create-quote-title"
            className="font-serif text-lg sm:text-2xl text-verse-text"
          >
            Create Quote
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-2 rounded-full verse-border text-verse-muted transition-colors duration-300 hover:text-verse-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {drafts.length > 0 && (
          <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-verse shrink-0">
            <span className="font-sans text-[10px] text-verse-muted tracking-widest uppercase block mb-1.5">
              Your drafts
            </span>
            <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLoadDraft(d.id)}
                    className={cn(
                      "font-sans text-xs px-3 py-1.5 rounded-full verse-border transition-all duration-300 max-w-[140px] truncate",
                      activeDraftId === d.id
                        ? "bg-verse-accent/20 text-verse-accent border-verse-accent/30"
                        : "text-verse-muted hover:text-verse-text"
                    )}
                  >
                    {d.text.slice(0, 24) || "Untitled"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDraft(d.id)}
                    aria-label="Delete draft"
                    className="text-verse-muted hover:text-verse-accent text-xs px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-4 sm:p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-verse">
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
              <label className="font-sans text-xs text-verse-muted tracking-widest uppercase mb-3 block">
                Style
              </label>
              <div className="space-y-4">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <span className="font-sans text-sm text-verse-text">
                    Show quote marks (&ldquo; &rdquo;)
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.showQuoteMarks}
                    onClick={() =>
                      updateDraft("showQuoteMarks", !draft.showQuoteMarks)
                    }
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0",
                      draft.showQuoteMarks
                        ? "bg-verse-accent"
                        : "bg-verse-bg verse-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-verse-text transition-transform duration-300",
                        draft.showQuoteMarks && "translate-x-5"
                      )}
                    />
                  </button>
                </label>

                <div>
                  <span className="font-sans text-xs text-verse-muted block mb-2">
                    Author name format
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AUTHOR_CASINGS.map((casing) => (
                      <button
                        key={casing}
                        type="button"
                        onClick={() => updateDraft("authorCasing", casing)}
                        className={cn(
                          "font-sans text-xs px-3 py-1.5 rounded-full verse-border transition-all duration-300",
                          draft.authorCasing === casing
                            ? "bg-verse-accent/20 text-verse-accent border-verse-accent/30"
                            : "text-verse-muted hover:text-verse-text"
                        )}
                      >
                        {AUTHOR_CASING_LABELS[casing]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="font-sans text-xs px-4 py-2 rounded-full verse-border text-verse-muted transition-all duration-300 hover:text-verse-text hover:-translate-y-0.5 disabled:opacity-40"
                >
                  {isUploading ? "Uploading…" : "Upload"}
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

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className={cn(
                  "flex-1 font-sans text-sm py-3 rounded-full verse-border text-verse-text",
                  "transition-all duration-300 hover:border-verse-accent/40 hover:-translate-y-0.5",
                  "disabled:opacity-40 disabled:pointer-events-none"
                )}
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={!draft.text.trim() || isSaving}
                className={cn(
                  "flex-1 font-sans text-sm py-3 rounded-full",
                  "bg-verse-accent text-verse-bg",
                  "transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5",
                  "disabled:opacity-40 disabled:pointer-events-none"
                )}
              >
                Publish
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
                  showQuoteMarks: draft.showQuoteMarks,
                  authorCasing: draft.authorCasing,
                }}
              />
            </div>
          </div>

          <div className="p-3 sm:p-6 bg-verse-bg/50 lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(92vh-4rem)] lg:overflow-y-auto">
            <p className="font-sans text-[10px] sm:text-xs text-verse-muted tracking-widest uppercase mb-2 sm:mb-4 text-center">
              Live Preview
            </p>
            <div className="max-w-[280px] sm:max-w-sm lg:max-w-none mx-auto">
              <QuoteCanvas
                text={draft.text}
                author={draft.author}
                theme={draft.theme}
                alignment={draft.alignment}
                backgroundImage={draft.backgroundImage}
                showQuoteMarks={draft.showQuoteMarks}
                authorCasing={draft.authorCasing}
                className="rounded-xl verse-border"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
