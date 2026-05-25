"use client";

import QuoteCard from "@/components/QuoteCard";
import { useFeaturedQuotesQuery } from "@/lib/hooks/use-quotes";

export default function FeaturedQuotes() {
  const { data: featuredQuotes = [], isLoading } = useFeaturedQuotesQuery();

  return (
    <section className="px-4 sm:px-6 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 md:mb-16 text-center">
          <p className="font-sans text-xs text-verse-accent tracking-[0.3em] uppercase mb-4">
            Curated
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-verse-text font-light">
            Featured Quotes
          </h2>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-h-[280px] md:min-h-[320px] rounded-2xl bg-verse-card verse-border animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
            {featuredQuotes.map((quote) => (
              <div
                key={quote.id}
                className="flex min-h-[280px] md:min-h-[320px]"
              >
                <QuoteCard quote={quote} featured className="w-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
