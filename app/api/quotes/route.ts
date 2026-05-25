
import {
  getPublishedQuotes,
  createPublishedQuote,
  deleteDraftAfterPublish,
} from "@/lib/services/quotes";
import type { QuoteCategory } from "@/types/quote";
import { NextRequest, NextResponse } from "next/server";
import { getSessionIdFromRequest } from "@/lib/session";
import { createQuoteSchema } from "@/lib/validations/quote";
import { isNextResponse, requireSessionId } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") ||
      "all") as QuoteCategory;
    const featuredParam = searchParams.get("featured");
    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
          ? false
          : undefined;

    const sessionId = getSessionIdFromRequest(req);
    const quotes = await getPublishedQuotes({
      category,
      featured,
      sessionId,
    });

    return NextResponse.json({ quotes }, { status: 200 });
  } catch (error) {
    console.error("GET /api/quotes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionResult = requireSessionId(req);
    if (isNextResponse(sessionResult)) {
      return sessionResult;
    }

    const body = await req.json();
    const parsed = createQuoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { draftId, ...data } = parsed.data;

    const quote = await createPublishedQuote({
      text: data.text.trim(),
      author: data.author?.trim() || "Anonymous",
      category: data.category,
      theme: data.theme,
      alignment: data.alignment,
      backgroundImage: data.backgroundImage,
      showQuoteMarks: data.showQuoteMarks,
      authorCasing: data.authorCasing,
    });

    await deleteDraftAfterPublish(draftId, sessionResult);

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotes error:", error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
