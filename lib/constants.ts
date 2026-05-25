export const QUERY_KEYS = {
  quotes: (category = "all", sort = "newest", search = "") =>
    ["quotes", category, sort, search] as const,
  featured: () => ["quotes", "featured"] as const,
  drafts: () => ["drafts"] as const,
  draft: (id: string) => ["drafts", id] as const,
};

export const STALE_TIME = {
  quotes: 1000 * 30,
  drafts: 1000 * 60,
};
