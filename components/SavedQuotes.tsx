"use client";

import QuoteCard from "@/components/QuoteCard";
import QuotesEmpty from "@/components/QuotesEmpty";
import { useBookmarkedQuotesQuery } from "@/lib/hooks/use-quotes";

export default function SavedQuotes() {
  const { data: quotes = [], isLoading, isError, refetch } =
    useBookmarkedQuotesQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[1, 2].map((i) => (
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
      <QuotesEmpty
        title="Could not load bookmarks"
        description="Something went wrong fetching your saved quotes."
        actionLabel="Retry"
        onAction={() => void refetch()}
        className="w-full"
      />
    );
  }

  if (quotes.length === 0) {
    return (
      <QuotesEmpty
        title="Nothing saved yet"
        description="Tap the bookmark icon on any quote to keep it here for later."
        className="w-full"
      />
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
