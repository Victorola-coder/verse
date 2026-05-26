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
        "flex flex-wrap justify-center gap-2 sm:gap-3",
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
              "font-sans text-[10px] sm:text-xs tracking-[0.15em] uppercase px-4 sm:px-5 py-2 sm:py-2.5 rounded-full",
              "verse-border transition-all duration-300 ease-verse",
              isActive
                ? "bg-verse-accent text-verse-bg border-verse-accent"
                : "text-verse-muted hover:text-verse-text hover:border-white/15 hover:-translate-y-0.5"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
