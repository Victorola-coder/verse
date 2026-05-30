export const QUERY_KEYS = {
  quotes: (category = "all", sort = "newest", search = "") =>
    ["quotes", category, sort, search] as const,
  featured: () => ["quotes", "featured"] as const,
  drafts: () => ["drafts"] as const,
  draft: (id: string) => ["drafts", id] as const,
};

export const STALE_TIME = {
  // Treat a cached quotes list as fresh for 5 minutes. Navigating between
  // pages within this window does NOT re-fetch — no spinner / re-flash.
  quotes: 1000 * 60 * 5,
  drafts: 1000 * 60,
};

// How long unused queries stay in memory before React Query evicts them.
// Bumped from the 5-minute default so a quick detour to /q/[id] and back
// still finds the feed warm in cache.
export const GC_TIME = 1000 * 60 * 30;
