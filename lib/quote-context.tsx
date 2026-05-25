"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SEED_QUOTES } from "@/lib/quotes-data";
import type { Quote, QuoteCategory, QuoteDraft } from "@/types/quote";

const STORAGE_KEY = "verse-quotes";

interface QuoteContextValue {
  quotes: Quote[];
  likedIds: Set<string>;
  activeCategory: QuoteCategory;
  isCreateOpen: boolean;
  setActiveCategory: (category: QuoteCategory) => void;
  openCreate: () => void;
  closeCreate: () => void;
  addQuote: (draft: QuoteDraft) => Quote;
  toggleLike: (id: string) => void;
  featuredQuotes: Quote[];
  filteredQuotes: Quote[];
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

function loadStoredQuotes(): Quote[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Quote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQuotes(quotes: Quote[]) {
  try {
    const userQuotes = quotes.filter(
      (q) => !SEED_QUOTES.some((seed) => seed.id === q.id)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userQuotes));
  } catch {
    // storage unavailable
  }
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>(SEED_QUOTES);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<QuoteCategory>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredQuotes();
    if (stored.length > 0) {
      setQuotes([...SEED_QUOTES, ...stored]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveQuotes(quotes);
    }
  }, [quotes, hydrated]);

  const openCreate = useCallback(() => setIsCreateOpen(true), []);
  const closeCreate = useCallback(() => setIsCreateOpen(false), []);

  const addQuote = useCallback((draft: QuoteDraft): Quote => {
    const newQuote: Quote = {
      id: `user-${Date.now()}`,
      text: draft.text.trim(),
      author: draft.author.trim() || "Anonymous",
      category: draft.category === "all" ? "life" : draft.category,
      theme: draft.theme,
      alignment: draft.alignment,
      backgroundImage: draft.backgroundImage,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    setQuotes((prev) => [newQuote, ...prev]);
    return newQuote;
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const wasLiked = prev.has(id);
      const next = new Set(prev);

      if (wasLiked) {
        next.delete(id);
      } else {
        next.add(id);
      }

      setQuotes((current) =>
        current.map((q) =>
          q.id === id
            ? {
                ...q,
                likes: wasLiked ? Math.max(0, q.likes - 1) : q.likes + 1,
              }
            : q
        )
      );

      return next;
    });
  }, []);

  const featuredQuotes = useMemo(
    () => quotes.filter((q) => q.featured).slice(0, 3),
    [quotes]
  );

  const filteredQuotes = useMemo(() => {
    if (activeCategory === "all") {
      return quotes;
    }
    return quotes.filter((q) => q.category === activeCategory);
  }, [quotes, activeCategory]);

  const value = useMemo(
    () => ({
      quotes,
      likedIds,
      activeCategory,
      isCreateOpen,
      setActiveCategory,
      openCreate,
      closeCreate,
      addQuote,
      toggleLike,
      featuredQuotes,
      filteredQuotes,
    }),
    [
      quotes,
      likedIds,
      activeCategory,
      isCreateOpen,
      addQuote,
      toggleLike,
      featuredQuotes,
      filteredQuotes,
      openCreate,
      closeCreate,
    ]
  );

  return (
    <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuotes must be used within QuoteProvider");
  }
  return context;
}
