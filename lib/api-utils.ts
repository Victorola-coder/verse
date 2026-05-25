import { NextResponse } from "next/server";
import { getSessionIdFromRequest } from "@/lib/session";

export function requireSessionId(req: Request): string | NextResponse {
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return NextResponse.json(
      { error: "Session required. Send X-Session-Id header." },
      { status: 400 }
    );
  }
  return sessionId;
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}
