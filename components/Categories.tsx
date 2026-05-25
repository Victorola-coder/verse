"use client";

import { CATEGORY_LABELS } from "@/lib/quotes-data";
import { useQuotes } from "@/lib/quote-context";
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

export default function Categories() {
  const { activeCategory, setActiveCategory } = useQuotes();

  return (
    <section className="px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            const label =
              category === "all" ? "All" : CATEGORY_LABELS[category];

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "font-sans text-xs tracking-[0.15em] uppercase px-5 py-2.5 rounded-full",
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
      </div>
    </section>
  );
}
