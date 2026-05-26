import { NextRequest, NextResponse } from "next/server";
import { getAllQuotesForAdmin } from "@/lib/services/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") ?? undefined;
    const featuredParam = searchParams.get("featured");
    const featured =
      featuredParam === "true"
        ? true
        : featuredParam === "false"
          ? false
          : undefined;

    const quotes = await getAllQuotesForAdmin({ search, featured });
    return NextResponse.json({ quotes }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/quotes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
