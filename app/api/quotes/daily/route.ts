import { NextRequest, NextResponse } from "next/server";
import { getDailyQuote } from "@/lib/services/quotes";
import { getSessionIdFromRequest } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const sessionId = getSessionIdFromRequest(req);
    const result = await getDailyQuote(sessionId);

    if (!result) {
      return NextResponse.json(
        { quote: null, dayIndex: null },
        { status: 200 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/quotes/daily error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily quote" },
      { status: 500 }
    );
  }
}
