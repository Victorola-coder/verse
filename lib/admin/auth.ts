import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  isAdminCookieValid,
} from "@/lib/admin/auth-edge";

export { ADMIN_COOKIE, adminCookieOptions, isAdminCookieValid };

const SECRET = process.env.ADMIN_SECRET;

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

export function isAdminPasswordValid(submitted: string | null | undefined) {
  if (!SECRET) {
    return false;
  }
  if (!submitted || typeof submitted !== "string") {
    return false;
  }
  return constantTimeEqual(submitted, SECRET);
}

export async function requireAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return isAdminCookieValid(token);
}
