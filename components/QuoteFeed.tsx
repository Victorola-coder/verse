"use client";

import QuoteCard from "@/components/QuoteCard";
import QuotesEmpty from "@/components/QuotesEmpty";
import { useQuotesQuery } from "@/lib/hooks/use-quotes";
import { useVerseStore } from "@/lib/store/verse";
import { CATEGORY_LABELS } from "@/lib/quotes-data";

export default function QuoteFeed() {
  const activeCategory = useVerseStore((s) => s.activeCategory);
  const { data: quotes = [], isLoading, isError, refetch } = useQuotesQuery();

  const categoryLabel =
    activeCategory === "all"
      ? "any mood"
      : CATEGORY_LABELS[activeCategory]?.toLowerCase() ?? activeCategory;

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
      <QuotesEmpty
        title="Could not load quotes"
        description="Check your database connection in .env.local, then run db:push and db:seed."
        actionLabel="Retry"
        onAction={() => void refetch()}
        className="w-full"
      />
    );
  }

  if (quotes.length === 0) {
    return (
      <QuotesEmpty
        title="This space is quiet"
        description={`No quotes for ${categoryLabel} yet. Write something worth remembering.`}
        actionLabel="Create your first quote"
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
