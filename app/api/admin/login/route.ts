import { NextRequest, NextResponse } from "next/server";
import { adminCookieOptions, isAdminPasswordValid } from "@/lib/admin/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";

    if (!process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "ADMIN_SECRET is not configured on the server" },
        { status: 503 }
      );
    }

    if (!isAdminPasswordValid(password)) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set({
      ...adminCookieOptions,
      value: process.env.ADMIN_SECRET,
    });
    return response;
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
