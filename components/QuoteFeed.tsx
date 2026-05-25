"use client";

import QuoteCard from "@/components/QuoteCard";
import { useQuotes } from "@/lib/quote-context";

export default function QuoteFeed() {
  const { filteredQuotes } = useQuotes();

  if (filteredQuotes.length === 0) {
    return (
      <p className="font-sans text-verse-muted text-center py-16">
        No quotes in this mood yet. Create one.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {filteredQuotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </div>
  );
}
