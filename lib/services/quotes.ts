import { prisma } from "@/lib/prisma";
import type { Quote as PrismaQuote } from "@prisma/client";
import type { AuthorCasing, Quote, QuoteCategory } from "@/types/quote";

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

export function serializeQuote(
  row: PrismaQuote,
  likedBySession = false,
  bookmarkedBySession = false
): Quote {
  return {
    id: row.id,
    text: row.text,
    author: row.author,
    category: row.category as Quote["category"],
    theme: row.theme as Quote["theme"],
    alignment: row.alignment as Quote["alignment"],
    backgroundImage: row.backgroundImage ?? undefined,
    showQuoteMarks: row.showQuoteMarks,
    authorCasing: parseAuthorCasing(row.authorCasing),
    featured: row.featured,
    likes: row.likesCount,
    createdAt: row.createdAt.toISOString(),
    likedByMe: likedBySession,
    bookmarkedByMe: bookmarkedBySession,
  };
}

export type QuoteSort = "newest" | "top" | "trending";

export async function getPublishedQuotes(options: {
  category?: QuoteCategory;
  featured?: boolean;
  sessionId?: string | null;
  search?: string;
  sort?: QuoteSort;
}) {
  const { category, featured, sessionId, search, sort = "newest" } = options;

  const where: {
    category?: string;
    featured?: boolean;
    OR?: Array<{
      text?: { contains: string; mode: "insensitive" };
      author?: { contains: string; mode: "insensitive" };
    }>;
  } = {};

  if (category && category !== "all") {
    where.category = category;
  }
  if (featured !== undefined) {
    where.featured = featured;
  }
  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    where.OR = [
      { text: { contains: trimmedSearch, mode: "insensitive" } },
      { author: { contains: trimmedSearch, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "top"
      ? [{ likesCount: "desc" as const }, { createdAt: "desc" as const }]
      : sort === "trending"
        ? [{ likesCount: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  let rows = await prisma.quote.findMany({
    where,
    orderBy,
  });

  if (sort === "trending") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    rows = rows.filter((r) => r.createdAt >= sevenDaysAgo);
    if (rows.length === 0) {
      rows = await prisma.quote.findMany({
        where,
        orderBy: [
          { likesCount: "desc" },
          { createdAt: "desc" },
        ],
        take: 12,
      });
    }
  }

  let likedIds = new Set<string>();
  let bookmarkedIds = new Set<string>();
  if (sessionId) {
    const ids = rows.map((r) => r.id);
    const [likes, bookmarks] = await Promise.all([
      prisma.quoteLike.findMany({
        where: { sessionId, quoteId: { in: ids } },
        select: { quoteId: true },
      }),
      prisma.quoteBookmark.findMany({
        where: { sessionId, quoteId: { in: ids } },
        select: { quoteId: true },
      }),
    ]);
    likedIds = new Set(likes.map((l) => l.quoteId));
    bookmarkedIds = new Set(bookmarks.map((b) => b.quoteId));
  }

  return rows.map((row) =>
    serializeQuote(row, likedIds.has(row.id), bookmarkedIds.has(row.id))
  );
}

export async function getQuoteById(id: string, sessionId?: string | null) {
  const row = await prisma.quote.findUnique({ where: { id } });
  if (!row) {
    return null;
  }

  let likedByMe = false;
  let bookmarkedByMe = false;
  if (sessionId) {
    const [like, bookmark] = await Promise.all([
      prisma.quoteLike.findUnique({
        where: { quoteId_sessionId: { quoteId: id, sessionId } },
      }),
      prisma.quoteBookmark.findUnique({
        where: { quoteId_sessionId: { quoteId: id, sessionId } },
      }),
    ]);
    likedByMe = !!like;
    bookmarkedByMe = !!bookmark;
  }

  return serializeQuote(row, likedByMe, bookmarkedByMe);
}

export async function toggleQuoteBookmark(quoteId: string, sessionId: string) {
  const existing = await prisma.quoteBookmark.findUnique({
    where: { quoteId_sessionId: { quoteId, sessionId } },
  });

  if (existing) {
    await prisma.quoteBookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.quoteBookmark.create({
    data: { quoteId, sessionId },
  });
  return { bookmarked: true };
}

export async function getBookmarkedQuotes(sessionId: string) {
  const bookmarks = await prisma.quoteBookmark.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    include: { quote: true },
  });

  const likedIds = new Set(
    (
      await prisma.quoteLike.findMany({
        where: {
          sessionId,
          quoteId: { in: bookmarks.map((b) => b.quoteId) },
        },
        select: { quoteId: true },
      })
    ).map((l) => l.quoteId)
  );

  return bookmarks.map((b) =>
    serializeQuote(b.quote, likedIds.has(b.quoteId), true)
  );
}

const VERSE_EPOCH = new Date("2025-01-01T00:00:00Z").getTime();

export function getDayIndex(date: Date = new Date()): number {
  const utcMidnight = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((utcMidnight - VERSE_EPOCH) / dayMs));
}

export async function getDailyQuote(sessionId?: string | null) {
  const featuredRows = await prisma.quote.findMany({
    where: { featured: true },
    orderBy: { createdAt: "asc" },
  });

  const pool = featuredRows.length
    ? featuredRows
    : await prisma.quote.findMany({
        orderBy: { createdAt: "asc" },
      });

  if (pool.length === 0) {
    return null;
  }

  const dayIndex = getDayIndex();
  const row = pool[dayIndex % pool.length];

  let likedByMe = false;
  let bookmarkedByMe = false;
  if (sessionId) {
    const [like, bookmark] = await Promise.all([
      prisma.quoteLike.findUnique({
        where: { quoteId_sessionId: { quoteId: row.id, sessionId } },
      }),
      prisma.quoteBookmark.findUnique({
        where: { quoteId_sessionId: { quoteId: row.id, sessionId } },
      }),
    ]);
    likedByMe = !!like;
    bookmarkedByMe = !!bookmark;
  }

  return {
    quote: serializeQuote(row, likedByMe, bookmarkedByMe),
    dayIndex,
  };
}

export async function createPublishedQuote(data: {
  text: string;
  author: string;
  category: string;
  theme: string;
  alignment: string;
  backgroundImage?: string | null;
  showQuoteMarks?: boolean;
  authorCasing?: string;
}) {
  const row = await prisma.quote.create({
    data: {
      text: data.text,
      author: data.author || "Anonymous",
      category: data.category,
      theme: data.theme,
      alignment: data.alignment,
      backgroundImage: data.backgroundImage ?? null,
      showQuoteMarks: data.showQuoteMarks ?? true,
      authorCasing: data.authorCasing ?? "as-typed",
    },
  });
  return serializeQuote(row);
}

export async function toggleQuoteLike(quoteId: string, sessionId: string) {
  const existing = await prisma.quoteLike.findUnique({
    where: {
      quoteId_sessionId: { quoteId, sessionId },
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.quoteLike.delete({ where: { id: existing.id } }),
      prisma.quote.update({
        where: { id: quoteId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.quoteLike.create({
      data: { quoteId, sessionId },
    }),
    prisma.quote.update({
      where: { id: quoteId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);

  return { liked: true };
}

export async function getDraftsForSession(sessionId: string) {
  return prisma.quoteDraft.findMany({
    where: { sessionId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDraftById(id: string, sessionId: string) {
  return prisma.quoteDraft.findFirst({
    where: { id, sessionId },
  });
}

export async function createDraftForSession(
  sessionId: string,
  data: {
    text?: string;
    author?: string;
    category?: string;
    theme?: string;
    alignment?: string;
    backgroundImage?: string | null;
    showQuoteMarks?: boolean;
    authorCasing?: string;
  }
) {
  return prisma.quoteDraft.create({
    data: {
      sessionId,
      text: data.text ?? "",
      author: data.author ?? "",
      category: data.category ?? "life",
      theme: data.theme ?? "dark",
      alignment: data.alignment ?? "center",
      backgroundImage: data.backgroundImage ?? null,
      showQuoteMarks: data.showQuoteMarks ?? true,
      authorCasing: data.authorCasing ?? "as-typed",
    },
  });
}

export async function updateDraftForSession(
  id: string,
  sessionId: string,
  data: {
    text?: string;
    author?: string;
    category?: string;
    theme?: string;
    alignment?: string;
    backgroundImage?: string | null;
    showQuoteMarks?: boolean;
    authorCasing?: string;
  }
) {
  const existing = await prisma.quoteDraft.findFirst({
    where: { id, sessionId },
  });
  if (!existing) {
    return null;
  }

  return prisma.quoteDraft.update({
    where: { id },
    data: {
      ...(data.text !== undefined && { text: data.text }),
      ...(data.author !== undefined && { author: data.author }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.alignment !== undefined && { alignment: data.alignment }),
      ...(data.backgroundImage !== undefined && {
        backgroundImage: data.backgroundImage,
      }),
      ...(data.showQuoteMarks !== undefined && {
        showQuoteMarks: data.showQuoteMarks,
      }),
      ...(data.authorCasing !== undefined && {
        authorCasing: data.authorCasing,
      }),
    },
  });
}

export async function deleteDraftForSession(id: string, sessionId: string) {
  const existing = await prisma.quoteDraft.findFirst({
    where: { id, sessionId },
  });
  if (!existing) {
    return false;
  }
  await prisma.quoteDraft.delete({ where: { id } });
  return true;
}

export async function deleteAllDraftsForSession(sessionId: string) {
  const result = await prisma.quoteDraft.deleteMany({
    where: { sessionId },
  });
  return result.count;
}

export async function deleteDraftAfterPublish(
  draftId: string | undefined,
  sessionId: string
) {
  if (!draftId) {
    return;
  }
  await prisma.quoteDraft.deleteMany({
    where: { id: draftId, sessionId },
  });
}
