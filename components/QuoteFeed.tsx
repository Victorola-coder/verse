"use client";

import QuoteCard from "@/components/QuoteCard";
import { useQuotesQuery } from "@/lib/hooks/use-quotes";

export default function QuoteFeed() {
  const { data: quotes = [], isLoading, isError } = useQuotesQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-verse-card verse-border animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="font-sans text-verse-muted text-center py-16">
        Could not load quotes. Check your database connection.
      </p>
    );
  }

  if (quotes.length === 0) {
    return (
      <p className="font-sans text-verse-muted text-center py-16">
        No quotes in this mood yet. Create one.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {quotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </div>
  );
}
