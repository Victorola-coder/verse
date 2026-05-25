export type QuoteTheme = "dark" | "beige" | "cinematic" | "minimal";

export type QuoteAlignment = "left" | "center" | "right";

export type AuthorCasing =
  | "as-typed"
  | "uppercase"
  | "lowercase"
  | "capitalize";

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
  showQuoteMarks: boolean;
  authorCasing: AuthorCasing;
  featured?: boolean;
  likes: number;
  likedByMe?: boolean;
  bookmarkedByMe?: boolean;
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
  showQuoteMarks: boolean;
  authorCasing: AuthorCasing;
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
  showQuoteMarks: boolean;
  authorCasing: AuthorCasing;
}

export const AUTHOR_CASING_LABELS: Record<AuthorCasing, string> = {
  "as-typed": "As typed",
  uppercase: "UPPERCASE",
  lowercase: "lowercase",
  capitalize: "Capitalize",
};

export const DEFAULT_QUOTE_DRAFT: QuoteDraft = {
  text: "",
  author: "",
  theme: "dark",
  alignment: "center",
  category: "life",
  showQuoteMarks: true,
  authorCasing: "as-typed",
};
