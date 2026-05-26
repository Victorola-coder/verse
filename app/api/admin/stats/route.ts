import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/services/admin";

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
