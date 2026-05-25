"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import ExportButton from "@/components/ExportButton";
import { useToggleLikeMutation } from "@/lib/hooks/use-quotes";
import type { Quote } from "@/types/quote";
import {
  formatAuthorAttribution,
  getAuthorClassName,
} from "@/utils/format-author";
import { cn } from "@/utils/cn";

interface QuoteCardProps {
  quote: Quote;
  compact?: boolean;
  featured?: boolean;
  className?: string;
}

export default function QuoteCard({
  quote,
  compact = false,
  featured = false,
  className,
}: QuoteCardProps) {
  const toggleLike = useToggleLikeMutation();
  const isLiked = quote.likedByMe ?? false;
  const authorLine = formatAuthorAttribution(quote.author, quote.authorCasing);

  const handleLike = async () => {
    try {
      await toggleLike.mutateAsync(quote.id);
    } catch {
      toast.error("Could not save your like");
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col verse-border rounded-2xl bg-verse-card",
        "transition-all duration-500 ease-verse",
        "hover:-translate-y-1 hover:border-white/15",
        "hover:shadow-[0_24px_48px_-12px_rgba(214,185,140,0.08)]",
        featured && "h-full p-6 md:p-8",
        !featured && compact && "p-6 md:p-8",
        !featured && !compact && "p-8 md:p-10",
        className
      )}
    >
      <blockquote
        className={cn(
          "font-serif font-light text-verse-text leading-[1.45]",
          featured && "flex-1 text-xl md:text-2xl",
          !featured && compact && "text-xl md:text-2xl",
          !featured && !compact && "text-2xl md:text-3xl"
        )}
      >
        {quote.showQuoteMarks && <span className="opacity-40">&ldquo;</span>}
        {quote.text}
        {quote.showQuoteMarks && <span className="opacity-40">&rdquo;</span>}
      </blockquote>

      <footer
        className={cn(
          "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
          featured ? "mt-6 pt-6 border-t border-verse" : "mt-8"
        )}
      >
        {authorLine && (
          <p
            className={cn(
              "font-sans text-xs text-verse-accent break-words",
              getAuthorClassName(quote.authorCasing)
            )}
          >
            {authorLine}
          </p>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLike}
            disabled={toggleLike.isPending}
            aria-label={isLiked ? "Unlike" : "Like"}
            className={cn(
              "p-2.5 rounded-full verse-border transition-all duration-300 ease-verse",
              "hover:-translate-y-0.5 hover:border-verse-accent/30",
              "disabled:opacity-40",
              isLiked && "text-verse-accent border-verse-accent/30"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </button>

          <ExportButton
            variant="both"
            canvasProps={{
              text: quote.text,
              author: quote.author,
              theme: quote.theme,
              alignment: quote.alignment,
              backgroundImage: quote.backgroundImage,
              showQuoteMarks: quote.showQuoteMarks,
              authorCasing: quote.authorCasing,
            }}
          />
        </div>
      </footer>

      {!compact && !featured && (
        <span className="absolute top-6 right-6 font-sans text-[10px] text-verse-muted tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {quote.likes} appreciations
        </span>
      )}
    </article>
  );
}
