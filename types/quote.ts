export type QuoteTheme = "dark" | "beige" | "cinematic" | "minimal";

export type QuoteAlignment = "left" | "center" | "right";

export type QuoteCategory =
  | "all"
  | "music"
  | "love"
  | "life"
  | "wisdom"
  | "poetry";

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: QuoteCategory;
  theme: QuoteTheme;
  alignment: QuoteAlignment;
  backgroundImage?: string;
  featured?: boolean;
  likes: number;
  likedByMe?: boolean;
  createdAt: string;
}

export interface SavedQuoteDraft {
  id: string;
  sessionId: string;
  text: string;
  author: string;
  category: Exclude<QuoteCategory, "all">;
  theme: QuoteTheme;
  alignment: QuoteAlignment;
  backgroundImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteDraft {
  id?: string;
  text: string;
  author: string;
  theme: QuoteTheme;
  alignment: QuoteAlignment;
  backgroundImage?: string;
  category: Exclude<QuoteCategory, "all">;
}

export const DEFAULT_QUOTE_DRAFT: QuoteDraft = {
  text: "",
  author: "",
  theme: "dark",
  alignment: "center",
  category: "life",
};
