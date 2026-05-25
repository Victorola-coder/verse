import { create } from "zustand";
import type { QuoteCategory } from "@/types/quote";

interface VerseState {
  activeCategory: QuoteCategory;
  isCreateOpen: boolean;
  activeDraftId: string | null;
  setActiveCategory: (category: QuoteCategory) => void;
  openCreate: (draftId?: string) => void;
  closeCreate: () => void;
  setActiveDraftId: (id: string | null) => void;
}

export const useVerseStore = create<VerseState>((set) => ({
  activeCategory: "all",
  isCreateOpen: false,
  activeDraftId: null,
  setActiveCategory: (category) => set({ activeCategory: category }),
  openCreate: (draftId) =>
    set({ isCreateOpen: true, activeDraftId: draftId ?? null }),
  closeCreate: () => set({ isCreateOpen: false, activeDraftId: null }),
  setActiveDraftId: (id) => set({ activeDraftId: id }),
}));
