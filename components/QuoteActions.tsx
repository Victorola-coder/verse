"use client";

import { useState } from "react";
import { Heart, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import ExportButton from "@/components/ExportButton";
import { useToggleLikeMutation } from "@/lib/hooks/use-quotes";
import type { Quote } from "@/types/quote";
import { cn } from "@/utils/cn";

interface QuoteActionsProps {
  quote: Quote;
}

export default function QuoteActions({ quote }: QuoteActionsProps) {
  const toggleLike = useToggleLikeMutation();
  const [liked, setLiked] = useState(quote.likedByMe ?? false);
  const [likes, setLikes] = useState(quote.likes);

  const handleLike = async () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
    try {
      await toggleLike.mutateAsync(quote.id);
    } catch {
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Could not save your like");
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/q/${quote.id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLike}
          aria-label={liked ? "Unlike" : "Like"}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full verse-border",
            "transition-all duration-300 hover:-translate-y-0.5 hover:border-verse-accent/30",
            liked && "text-verse-accent border-verse-accent/30"
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          <span className="font-sans text-sm">{likes}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          aria-label="Copy link"
          className="p-2.5 rounded-full verse-border text-verse-muted hover:text-verse-accent hover:border-verse-accent/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>

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
  );
}
