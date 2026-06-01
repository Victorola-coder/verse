"use client";

import { CATEGORY_LABELS } from "@/lib/quotes-data";
import { useVerseStore } from "@/lib/store/verse";
import type { QuoteCategory } from "@/types/quote";
import { cn } from "@/utils/cn";

const CATEGORIES: QuoteCategory[] = [
  "all",
  "music",
  "love",
  "life",
  "wisdom",
  "poetry",
];

export default function Categories({ className }: { className?: string }) {
  const { activeCategory, setActiveCategory } = useVerseStore();

  return (
    <div
      className={cn(
        // Horizontal-scroll row on mobile (so chips stay on one line and the
        // active one can scroll into view), wraps + centers on tablet+.
        "flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0",
        "sm:flex-wrap sm:justify-center sm:overflow-visible",
        "snap-x snap-mandatory sm:snap-none",
        className
      )}
    >
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        const label = category === "all" ? "All" : CATEGORY_LABELS[category];

        return (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "shrink-0 snap-start font-sans text-[11px] sm:text-xs tracking-[0.15em] uppercase",
              "px-4 sm:px-5 py-2 sm:py-2.5 rounded-full verse-border",
              "transition-all duration-300 ease-verse active:scale-95",
              isActive
                ? "bg-verse-accent text-verse-bg border-verse-accent"
                : "text-verse-muted [@media(hover:hover)]:hover:text-verse-text [@media(hover:hover)]:hover:border-white/15 [@media(hover:hover)]:hover:-translate-y-0.5"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
