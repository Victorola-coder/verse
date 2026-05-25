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
  createdAt: string;
}

export interface QuoteDraft {
  text: string;
  author: string;
  theme: QuoteTheme;
  alignment: QuoteAlignment;
  backgroundImage?: string;
  category: QuoteCategory;
}

export const DEFAULT_QUOTE_DRAFT: QuoteDraft = {
  text: "",
  author: "",
  theme: "dark",
  alignment: "center",
  category: "life",
};
