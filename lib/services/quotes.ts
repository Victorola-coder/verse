import type { Quote as PrismaQuote } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
  likedBySession = false
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
  };
}

export async function getPublishedQuotes(options: {
  category?: QuoteCategory;
  featured?: boolean;
  sessionId?: string | null;
}) {
  const { category, featured, sessionId } = options;

  const where: {
    category?: string;
    featured?: boolean;
  } = {};

  if (category && category !== "all") {
    where.category = category;
  }
  if (featured !== undefined) {
    where.featured = featured;
  }

  const rows = await prisma.quote.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  let likedIds = new Set<string>();
  if (sessionId) {
    const likes = await prisma.quoteLike.findMany({
      where: {
        sessionId,
        quoteId: { in: rows.map((r) => r.id) },
      },
      select: { quoteId: true },
    });
    likedIds = new Set(likes.map((l) => l.quoteId));
  }

  return rows.map((row) => serializeQuote(row, likedIds.has(row.id)));
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
