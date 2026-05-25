"use client";

import QuoteCard from "@/components/QuoteCard";
import { useQuotes } from "@/lib/quote-context";

export default function FeaturedQuotes() {
  const { featuredQuotes } = useQuotes();

  return (
    <section className="px-6 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 md:mb-16 text-center">
          <p className="font-sans text-xs text-verse-accent tracking-[0.3em] uppercase mb-4">
            Curated
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-verse-text font-light">
            Featured Quotes
          </h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredQuotes.map((quote, index) => (
            <div
              key={quote.id}
              className={index === 0 ? "lg:col-span-1 lg:row-span-1" : ""}
              style={{
                animationDelay: `${index * 120}ms`,
              }}
            >
              <QuoteCard quote={quote} compact={index > 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
