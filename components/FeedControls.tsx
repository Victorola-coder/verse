"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useVerseStore, type QuoteSort } from "@/lib/store/verse";
import { cn } from "@/utils/cn";

const SORT_TABS: { id: QuoteSort; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "top", label: "Most loved" },
  { id: "trending", label: "Trending" },
];

export default function FeedControls() {
  const searchQuery = useVerseStore((s) => s.searchQuery);
  const setSearchQuery = useVerseStore((s) => s.setSearchQuery);
  const sort = useVerseStore((s) => s.sort);
  const setSort = useVerseStore((s) => s.setSort);

  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (localQuery !== searchQuery) {
        setSearchQuery(localQuery);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [localQuery, searchQuery, setSearchQuery]);

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-verse-muted pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Search quotes or authors…"
          aria-label="Search quotes"
          className={cn(
            "w-full bg-verse-card verse-border rounded-full",
            "pl-11 pr-10 py-3 font-sans text-sm text-verse-text",
            "placeholder:text-verse-muted/60",
            "outline-none transition-colors duration-300",
            "focus:border-verse-accent/30"
          )}
        />
        {localQuery && (
          <button
            type="button"
            onClick={() => setLocalQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-verse-muted hover:text-verse-text transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-1 sm:gap-2 overflow-x-auto -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSort(tab.id)}
            className={cn(
              "shrink-0 font-sans text-xs px-4 py-2 rounded-full verse-border transition-all duration-300",
              sort === tab.id
                ? "bg-verse-accent/20 text-verse-accent border-verse-accent/30"
                : "text-verse-muted hover:text-verse-text"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
