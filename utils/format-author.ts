import type { AuthorCasing } from "@/types/quote";

export function formatAuthorName(name: string, casing: AuthorCasing): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "";
  }

  switch (casing) {
    case "uppercase":
      return trimmed.toUpperCase();
    case "lowercase":
      return trimmed.toLowerCase();
    case "capitalize":
      return trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
    case "as-typed":
    default:
      return trimmed;
  }
}

export function getAuthorClassName(casing: AuthorCasing): string {
  switch (casing) {
    case "uppercase":
      return "tracking-[0.2em] uppercase";
    case "lowercase":
      return "tracking-wide lowercase";
    case "capitalize":
      return "tracking-wide capitalize";
    case "as-typed":
    default:
      return "tracking-normal";
  }
}

export function formatAuthorAttribution(
  name: string,
  casing: AuthorCasing
): string {
  const formatted = formatAuthorName(name, casing);
  return formatted ? `— ${formatted}` : "";
}
