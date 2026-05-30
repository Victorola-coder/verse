import { isAxiosError } from "axios";

export function extractApiError(error: unknown): string | null {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "error" in data) {
      const inner = (data as { error: unknown }).error;
      if (typeof inner === "string") {
        return inner;
      }
      // zod fieldErrors shape: { field: ["msg", ...] }
      if (inner && typeof inner === "object") {
        const first = Object.values(inner)[0];
        if (Array.isArray(first) && typeof first[0] === "string") {
          return first[0];
        }
      }
    }
    return error.message || null;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return null;
}
