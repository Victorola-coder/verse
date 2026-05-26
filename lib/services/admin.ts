import { prisma } from "@/lib/prisma";
import { serializeQuote } from "@/lib/services/quotes";
import type { Quote } from "@/types/quote";

export interface AdminStats {
  totalQuotes: number;
  totalLikes: number;
  totalBookmarks: number;
  totalDrafts: number;
  uniqueSessions: number;
  quotesLast7Days: number;
  quotesLast30Days: number;
  featuredCount: number;
  topQuotes: Quote[];
  recentQuotes: Quote[];
  activityByDay: { date: string; quotes: number; likes: number }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUTCDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export async function getAdminStats(): Promise<AdminStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * DAY_MS);
  const thirtyDaysAgo = new Date(Date.now() - 30 * DAY_MS);
  const fourteenDaysAgo = new Date(Date.now() - 14 * DAY_MS);

  const [
    totalQuotes,
    totalLikes,
    totalBookmarks,
    totalDrafts,
    featuredCount,
    quotesLast7Days,
    quotesLast30Days,
    likeSessions,
    bookmarkSessions,
    draftSessions,
    topRows,
    recentRows,
    recentQuoteRows,
    recentLikeRows,
  ] = await Promise.all([
    prisma.quote.count(),
    prisma.quoteLike.count(),
    prisma.quoteBookmark.count(),
    prisma.quoteDraft.count(),
    prisma.quote.count({ where: { featured: true } }),
    prisma.quote.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.quote.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.quoteLike.findMany({
      distinct: ["sessionId"],
      select: { sessionId: true },
    }),
    prisma.quoteBookmark.findMany({
      distinct: ["sessionId"],
      select: { sessionId: true },
    }),
    prisma.quoteDraft.findMany({
      distinct: ["sessionId"],
      select: { sessionId: true },
    }),
    prisma.quote.findMany({
      orderBy: [{ likesCount: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.quote.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.quoteLike.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const uniqueSessions = new Set<string>();
  for (const row of likeSessions) uniqueSessions.add(row.sessionId);
  for (const row of bookmarkSessions) uniqueSessions.add(row.sessionId);
  for (const row of draftSessions) uniqueSessions.add(row.sessionId);

  const activityMap = new Map<string, { quotes: number; likes: number }>();
  for (let i = 13; i >= 0; i--) {
    const day = startOfUTCDay(new Date(now.getTime() - i * DAY_MS));
    activityMap.set(day.toISOString().slice(0, 10), { quotes: 0, likes: 0 });
  }
  for (const row of recentQuoteRows) {
    const key = startOfUTCDay(row.createdAt).toISOString().slice(0, 10);
    const cell = activityMap.get(key);
    if (cell) cell.quotes += 1;
  }
  for (const row of recentLikeRows) {
    const key = startOfUTCDay(row.createdAt).toISOString().slice(0, 10);
    const cell = activityMap.get(key);
    if (cell) cell.likes += 1;
  }

  return {
    totalQuotes,
    totalLikes,
    totalBookmarks,
    totalDrafts,
    uniqueSessions: uniqueSessions.size,
    quotesLast7Days,
    quotesLast30Days,
    featuredCount,
    topQuotes: topRows.map((r) => serializeQuote(r)),
    recentQuotes: recentRows.map((r) => serializeQuote(r)),
    activityByDay: Array.from(activityMap.entries()).map(([date, v]) => ({
      date,
      quotes: v.quotes,
      likes: v.likes,
    })),
  };
}

export const ADMIN_QUOTES_PAGE_SIZE = 10;

export async function getAllQuotesForAdmin(options: {
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const { search, featured } = options;
  const pageSize = Math.max(1, options.pageSize ?? ADMIN_QUOTES_PAGE_SIZE);
  const page = Math.max(1, options.page ?? 1);

  const where: {
    featured?: boolean;
    OR?: Array<{
      text?: { contains: string; mode: "insensitive" };
      author?: { contains: string; mode: "insensitive" };
    }>;
  } = {};
  if (featured !== undefined) {
    where.featured = featured;
  }
  const trimmed = search?.trim();
  if (trimmed) {
    where.OR = [
      { text: { contains: trimmed, mode: "insensitive" } },
      { author: { contains: trimmed, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.quote.count({ where }),
  ]);

  return {
    quotes: rows.map((r) => serializeQuote(r)),
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function updateQuoteAsAdmin(
  id: string,
  data: Partial<{
    text: string;
    author: string;
    category: string;
    theme: string;
    alignment: string;
    backgroundImage: string | null;
    showQuoteMarks: boolean;
    authorCasing: string;
    featured: boolean;
  }>
) {
  const row = await prisma.quote.update({
    where: { id },
    data,
  });
  return serializeQuote(row);
}

export async function deleteQuoteAsAdmin(id: string) {
  await prisma.quote.delete({ where: { id } });
}
