import { create } from "zustand";
import type { QuoteCategory } from "@/types/quote";

export type QuoteSort = "newest" | "top" | "trending";

interface VerseState {
  activeCategory: QuoteCategory;
  searchQuery: string;
  sort: QuoteSort;
  isCreateOpen: boolean;
  activeDraftId: string | null;
  setActiveCategory: (category: QuoteCategory) => void;
  setSearchQuery: (query: string) => void;
  setSort: (sort: QuoteSort) => void;
  openCreate: (draftId?: string) => void;
  closeCreate: () => void;
  setActiveDraftId: (id: string | null) => void;
}

export const useVerseStore = create<VerseState>((set) => ({
  activeCategory: "all",
  searchQuery: "",
  sort: "newest",
  isCreateOpen: false,
  activeDraftId: null,
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSort: (sort) => set({ sort }),
  openCreate: (draftId) =>
    set({ isCreateOpen: true, activeDraftId: draftId ?? null }),
  closeCreate: () => set({ isCreateOpen: false, activeDraftId: null }),
  setActiveDraftId: (id) => set({ activeDraftId: id }),
}));
