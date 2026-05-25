"use client";

import { useVerseStore } from "@/lib/store/verse";
import { cn } from "@/utils/cn";

interface QuotesEmptyProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  className?: string;
  onAction?: () => void;
}

export default function QuotesEmpty({
  title = "Nothing here yet",
  description = "Be the first to leave a line that lingers. Create a quote and share the mood.",
  actionLabel = "Create Quote",
  className,
  onAction,
}: QuotesEmptyProps) {
  const openCreate = useVerseStore((s) => s.openCreate);

  const handleAction = () => {
    if (onAction) {
      onAction();
      return;
    }
    openCreate();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        "rounded-2xl verse-border bg-verse-card/50 px-8 py-16 md:py-20",
        className
      )}
    >
      <p
        className="font-serif text-6xl md:text-7xl text-verse-muted/20 leading-none mb-6 select-none"
        aria-hidden
      >
        &ldquo;
      </p>

      <h3 className="font-serif text-2xl md:text-3xl text-verse-text font-light mb-3">
        {title}
      </h3>

      <p className="font-sans text-sm text-verse-muted max-w-sm leading-relaxed mb-8">
        {description}
      </p>

      <button
        type="button"
        onClick={handleAction}
        className={cn(
          "font-sans text-sm px-8 py-3 rounded-full",
          "bg-verse-accent text-verse-bg",
          "transition-all duration-300 ease-verse",
          "hover:opacity-90 hover:-translate-y-0.5"
        )}
      >
        {actionLabel}
      </button>
    </div>
  );
}
