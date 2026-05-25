import { NextRequest, NextResponse } from "next/server";
import { getBookmarkedQuotes } from "@/lib/services/quotes";
import { isNextResponse, requireSessionId } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const sessionResult = requireSessionId(req);
    if (isNextResponse(sessionResult)) {
      return sessionResult;
    }

    const quotes = await getBookmarkedQuotes(sessionResult);
    return NextResponse.json({ quotes }, { status: 200 });
  } catch (error) {
    console.error("GET /api/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
