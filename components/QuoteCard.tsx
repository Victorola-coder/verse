"use client";

import { Heart } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import { useQuotes } from "@/lib/quote-context";
import type { Quote } from "@/types/quote";
import { cn } from "@/utils/cn";

interface QuoteCardProps {
  quote: Quote;
  compact?: boolean;
}

export default function QuoteCard({ quote, compact = false }: QuoteCardProps) {
  const { likedIds, toggleLike } = useQuotes();
  const isLiked = likedIds.has(quote.id);

  return (
    <article
      className={cn(
        "group relative flex flex-col verse-border rounded-2xl bg-verse-card p-8 md:p-10",
        "transition-all duration-500 ease-verse",
        "hover:-translate-y-1 hover:border-white/15",
        "hover:shadow-[0_24px_48px_-12px_rgba(214,185,140,0.08)]",
        compact && "p-6 md:p-8"
      )}
    >
      <blockquote
        className={cn(
          "font-serif font-light text-verse-text leading-[1.45]",
          compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl"
        )}
      >
        &ldquo;{quote.text}&rdquo;
      </blockquote>

      <footer className="mt-8 flex items-end justify-between gap-4">
        <p className="font-sans text-xs text-verse-accent tracking-[0.2em] uppercase">
          — {quote.author}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleLike(quote.id)}
            aria-label={isLiked ? "Unlike" : "Like"}
            className={cn(
              "p-2.5 rounded-full verse-border transition-all duration-300 ease-verse",
              "hover:-translate-y-0.5 hover:border-verse-accent/30",
              isLiked && "text-verse-accent border-verse-accent/30"
            )}
          >
            <Heart
              className={cn("h-4 w-4", isLiked && "fill-current")}
            />
          </button>

          <ExportButton
            canvasProps={{
              text: quote.text,
              author: quote.author,
              theme: quote.theme,
              alignment: quote.alignment,
              backgroundImage: quote.backgroundImage,
            }}
          />
        </div>
      </footer>

      {!compact && (
        <span className="absolute top-6 right-6 font-sans text-[10px] text-verse-muted tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {quote.likes} appreciations
        </span>
      )}
    </article>
  );
}
