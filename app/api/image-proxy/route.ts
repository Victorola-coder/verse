import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = ["supabase.co", "supabase.in"];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return false;
    }
    return ALLOWED_HOSTS.some((host) => parsed.hostname.endsWith(host));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl || !isAllowedUrl(imageUrl)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    const response = await fetch(imageUrl, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 502 }
      );
    }

    const contentType =
      response.headers.get("content-type") ?? "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/image-proxy error:", error);
    return NextResponse.json(
      { error: "Image proxy failed" },
      { status: 500 }
    );
  }
}
