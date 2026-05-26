"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  Save,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Quote, QuoteAlignment, QuoteCategory, QuoteTheme } from "@/types/quote";
import { CATEGORY_LABELS } from "@/lib/quotes-data";
import { THEME_LABELS } from "@/lib/themes";
import { AUTHOR_CASING_LABELS, type AuthorCasing } from "@/types/quote";
import { formatAuthorAttribution } from "@/utils/format-author";
import { cn } from "@/utils/cn";

type EditableQuote = Quote & { _dirty?: boolean };

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Exclude<
  QuoteCategory,
  "all"
>[];
const THEMES: QuoteTheme[] = ["dark", "beige", "cinematic", "minimal"];
const ALIGNMENTS: QuoteAlignment[] = ["left", "center", "right"];
const CASINGS = Object.keys(AUTHOR_CASING_LABELS) as AuthorCasing[];

interface PaginatedQuotesResponse {
  quotes: Quote[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<EditableQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(handle);
  }, [search]);

  // Reset to page 1 whenever the search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.set("q", debouncedSearch);
        }
        params.set("page", String(page));
        const res = await fetch(`/api/admin/quotes?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch");
        }
        const data = (await res.json()) as PaginatedQuotesResponse;
        if (!cancelled) {
          setQuotes(data.quotes);
          setTotal(data.total);
          setPageCount(data.pageCount);
        }
      } catch {
        if (!cancelled) {
          toast.error("Could not load quotes");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page]);

  const summary = useMemo(() => {
    const featured = quotes.filter((q) => q.featured).length;
    return { total, featured };
  }, [quotes, total]);

  function updateLocal(id: string, patch: Partial<Quote>) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch, _dirty: true } : q))
    );
  }

  async function saveQuote(id: string) {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;

    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: quote.text,
          author: quote.author,
          category: quote.category,
          theme: quote.theme,
          alignment: quote.alignment,
          showQuoteMarks: quote.showQuoteMarks,
          authorCasing: quote.authorCasing,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed");
      }
      const data = (await res.json()) as { quote: Quote };
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...data.quote, _dirty: false } : q))
      );
      setEditingId(null);
      toast.success("Saved");
    } catch {
      toast.error("Could not save quote");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleFeatured(id: string, next: boolean) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, featured: next } : q))
    );
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: next }),
      });
      if (!res.ok) {
        throw new Error("Failed");
      }
      toast.success(next ? "Marked as featured" : "Removed from featured");
    } catch {
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, featured: !next } : q))
      );
      toast.error("Could not update featured state");
    }
  }

  async function deleteQuote(id: string) {
    const quote = quotes.find((q) => q.id === id);
    if (!quote) return;
    if (!window.confirm(`Delete this quote? This cannot be undone.\n\n“${quote.text.slice(0, 80)}…”`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed");
      }
      setQuotes((prev) => {
        const next = prev.filter((q) => q.id !== id);
        if (next.length === 0 && page > 1) {
          setPage(page - 1);
        }
        return next;
      });
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Quote deleted");
    } catch {
      toast.error("Could not delete quote");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-verse-muted pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text or author…"
            className={cn(
              "w-full bg-verse-card verse-border rounded-full",
              "pl-11 pr-4 py-2.5 font-sans text-sm text-verse-text",
              "placeholder:text-verse-muted/60 outline-none",
              "focus:border-verse-accent/30 transition-colors duration-300"
            )}
          />
        </div>
        <p className="font-sans text-xs text-verse-muted">
          {isLoading
            ? "Loading…"
            : summary.total === 0
              ? "No quotes"
              : `${summary.total} ${summary.total === 1 ? "quote" : "quotes"} · page ${page} of ${pageCount}`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-verse-card verse-border animate-pulse"
            />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center font-sans text-sm text-verse-muted py-16">
          No quotes match.
        </div>
      ) : (
        <ul className="space-y-2">
          {quotes.map((q) => {
            const isEditing = editingId === q.id;
            return (
              <li
                key={q.id}
                className={cn(
                  "rounded-xl verse-border bg-verse-card/60 transition-colors",
                  isEditing && "border-verse-accent/30 bg-verse-card"
                )}
              >
                <div className="p-4 sm:p-5 flex flex-col gap-3">
                  {isEditing ? (
                    <>
                      <textarea
                        value={q.text}
                        onChange={(e) =>
                          updateLocal(q.id, { text: e.target.value })
                        }
                        rows={3}
                        className="w-full bg-verse-bg verse-border rounded-lg px-3 py-2 font-serif text-base text-verse-text outline-none focus:border-verse-accent/30"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={q.author}
                          onChange={(e) =>
                            updateLocal(q.id, { author: e.target.value })
                          }
                          placeholder="Author"
                          className="w-full bg-verse-bg verse-border rounded-lg px-3 py-2 font-sans text-sm text-verse-text outline-none focus:border-verse-accent/30"
                        />
                        <select
                          value={q.category}
                          onChange={(e) =>
                            updateLocal(q.id, {
                              category: e.target.value as QuoteCategory,
                            })
                          }
                          className="w-full bg-verse-bg verse-border rounded-lg px-3 py-2 font-sans text-sm text-verse-text outline-none focus:border-verse-accent/30"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {CATEGORY_LABELS[c]}
                            </option>
                          ))}
                        </select>
                        <select
                          value={q.theme}
                          onChange={(e) =>
                            updateLocal(q.id, {
                              theme: e.target.value as QuoteTheme,
                            })
                          }
                          className="w-full bg-verse-bg verse-border rounded-lg px-3 py-2 font-sans text-sm text-verse-text outline-none focus:border-verse-accent/30"
                        >
                          {THEMES.map((t) => (
                            <option key={t} value={t}>
                              {THEME_LABELS[t]}
                            </option>
                          ))}
                        </select>
                        <select
                          value={q.alignment}
                          onChange={(e) =>
                            updateLocal(q.id, {
                              alignment: e.target.value as QuoteAlignment,
                            })
                          }
                          className="w-full bg-verse-bg verse-border rounded-lg px-3 py-2 font-sans text-sm text-verse-text outline-none focus:border-verse-accent/30"
                        >
                          {ALIGNMENTS.map((a) => (
                            <option key={a} value={a} className="capitalize">
                              {a}
                            </option>
                          ))}
                        </select>
                        <select
                          value={q.authorCasing}
                          onChange={(e) =>
                            updateLocal(q.id, {
                              authorCasing: e.target.value as AuthorCasing,
                            })
                          }
                          className="w-full bg-verse-bg verse-border rounded-lg px-3 py-2 font-sans text-sm text-verse-text outline-none focus:border-verse-accent/30"
                        >
                          {CASINGS.map((c) => (
                            <option key={c} value={c}>
                              {AUTHOR_CASING_LABELS[c]}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 px-3 py-2 font-sans text-sm text-verse-text">
                          <input
                            type="checkbox"
                            checked={q.showQuoteMarks}
                            onChange={(e) =>
                              updateLocal(q.id, {
                                showQuoteMarks: e.target.checked,
                              })
                            }
                          />
                          Show “quote marks”
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-4">
                      <blockquote className="font-serif text-base sm:text-lg text-verse-text leading-snug flex-1 min-w-0">
                        {q.showQuoteMarks && (
                          <span className="opacity-40">“</span>
                        )}
                        {q.text}
                        {q.showQuoteMarks && (
                          <span className="opacity-40">”</span>
                        )}
                        {q.author && (
                          <span className="block mt-2 font-sans text-xs text-verse-muted">
                            —{" "}
                            {formatAuthorAttribution(
                              q.author,
                              q.authorCasing
                            )}{" "}
                            ·{" "}
                            {(CATEGORY_LABELS as Record<string, string>)[
                              q.category
                            ] ?? q.category}{" "}
                            · {THEME_LABELS[q.theme]}
                          </span>
                        )}
                      </blockquote>
                      <div className="font-sans text-xs text-verse-muted shrink-0 flex flex-col items-end gap-1">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {q.likes}
                        </span>
                        <span className="text-[10px]">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-verse">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(q.id, !q.featured)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs verse-border transition-colors",
                          q.featured
                            ? "text-verse-accent border-verse-accent/30 bg-verse-accent/10"
                            : "text-verse-muted hover:text-verse-text"
                        )}
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5",
                            q.featured && "fill-current"
                          )}
                        />
                        {q.featured ? "Featured" : "Feature"}
                      </button>
                      <Link
                        href={`/q/${q.id}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs verse-border text-verse-muted hover:text-verse-text transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs verse-border text-verse-muted hover:text-verse-text transition-colors"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveQuote(q.id)}
                            disabled={savingId === q.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs bg-verse-accent text-verse-bg hover:opacity-90 transition-opacity disabled:opacity-40"
                          >
                            <Save className="h-3 w-3" />
                            {savingId === q.id ? "Saving…" : "Save"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingId(q.id)}
                            className="px-3 py-1.5 rounded-full font-sans text-xs verse-border text-verse-text hover:border-verse-accent/40 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteQuote(q.id)}
                            disabled={deletingId === q.id}
                            aria-label="Delete quote"
                            className="p-1.5 rounded-full font-sans text-xs verse-border text-verse-muted hover:text-red-400 hover:border-red-400/30 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!isLoading && pageCount > 1 && (
        <nav
          aria-label="Quotes pagination"
          className="flex items-center justify-center gap-2 pt-4"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className={cn(
              "p-2 rounded-full verse-border text-verse-muted",
              "transition-colors hover:text-verse-text",
              "disabled:opacity-30 disabled:pointer-events-none"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 ||
                p === pageCount ||
                (p >= page - 1 && p <= page + 1)
            )
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-2">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-verse-muted/50 font-sans text-xs">
                    …
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setPage(p)}
                  aria-label={`Go to page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={cn(
                    "min-w-[2rem] px-2 py-1 rounded-full font-sans text-xs transition-colors",
                    p === page
                      ? "bg-verse-accent/20 text-verse-accent border border-verse-accent/30"
                      : "verse-border text-verse-muted hover:text-verse-text"
                  )}
                >
                  {p}
                </button>
              </span>
            ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            aria-label="Next page"
            className={cn(
              "p-2 rounded-full verse-border text-verse-muted",
              "transition-colors hover:text-verse-text",
              "disabled:opacity-30 disabled:pointer-events-none"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
