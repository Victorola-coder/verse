import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "verse_admin";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function isAdminCookieValid(token: string | null | undefined) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) {
    return false;
  }
  return constantTimeEqual(token, secret);
}

export function getAdminCookieFromRequest(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value ?? null;
}

export const adminCookieOptions = {
  name: ADMIN_COOKIE,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
