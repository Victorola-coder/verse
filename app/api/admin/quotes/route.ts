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
    const pageRaw = Number(searchParams.get("page") ?? 1);
    const page =
      Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

    const result = await getAllQuotesForAdmin({ search, featured, page });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/quotes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
