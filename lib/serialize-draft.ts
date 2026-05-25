import type { AuthorCasing, SavedQuoteDraft } from "@/types/quote";

function parseAuthorCasing(value: string): AuthorCasing {
  const allowed: AuthorCasing[] = [
    "as-typed",
    "uppercase",
    "lowercase",
    "capitalize",
  ];
  return allowed.includes(value as AuthorCasing)
    ? (value as AuthorCasing)
    : "as-typed";
}

export function serializeDraft(row: {
  id: string;
  sessionId: string;
  text: string;
  author: string;
  category: string;
  theme: string;
  alignment: string;
  backgroundImage: string | null;
  showQuoteMarks: boolean;
  authorCasing: string;
  createdAt: Date;
  updatedAt: Date;
}): SavedQuoteDraft {
  return {
    id: row.id,
    sessionId: row.sessionId,
    text: row.text,
    author: row.author,
    category: row.category as SavedQuoteDraft["category"],
    theme: row.theme as SavedQuoteDraft["theme"],
    alignment: row.alignment as SavedQuoteDraft["alignment"],
    backgroundImage: row.backgroundImage,
    showQuoteMarks: row.showQuoteMarks,
    authorCasing: parseAuthorCasing(row.authorCasing),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
