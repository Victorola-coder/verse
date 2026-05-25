import { prisma } from "@/lib/prisma";
import { toggleQuoteBookmark } from "@/lib/services/quotes";
import { NextRequest, NextResponse } from "next/server";
import { isNextResponse, requireSessionId } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = requireSessionId(req);
    if (isNextResponse(sessionResult)) {
      return sessionResult;
    }

    const { id } = await params;

    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const result = await toggleQuoteBookmark(id, sessionResult);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/quotes/[id]/bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
