const SESSION_KEY = "verse_session_id";

export function getSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `session-${Date.now()}`;
  }
}

export function getSessionIdFromRequest(req: Request): string | null {
  const header = req.headers.get("x-session-id");
  if (header?.trim()) {
    return header.trim();
  }
  return null;
}
