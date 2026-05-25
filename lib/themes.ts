import type { QuoteTheme } from "@/types/quote";

export interface ThemeStyle {
  background: string;
  text: string;
  muted: string;
  accent: string;
  overlay?: string;
}

export const THEME_STYLES: Record<QuoteTheme, ThemeStyle> = {
  dark: {
    background: "#0E0E0E",
    text: "#F5F1EA",
    muted: "#9D9D9D",
    accent: "#D6B98C",
    overlay: "rgba(14, 14, 14, 0.55)",
  },
  beige: {
    background: "#F5F1EA",
    text: "#1A1814",
    muted: "#6B6560",
    accent: "#8B7355",
    overlay: "rgba(245, 241, 234, 0.45)",
  },
  cinematic: {
    background:
      "linear-gradient(165deg, #0E0E0E 0%, #1a1510 45%, #0E0E0E 100%)",
    text: "#F5F1EA",
    muted: "#B8A99A",
    accent: "#D6B98C",
    overlay: "rgba(14, 14, 14, 0.5)",
  },
  minimal: {
    background: "#161616",
    text: "#F5F1EA",
    muted: "#9D9D9D",
    accent: "#D6B98C",
    overlay: "rgba(22, 22, 22, 0.6)",
  },
};

export const THEME_LABELS: Record<QuoteTheme, string> = {
  dark: "Dark",
  beige: "Beige",
  cinematic: "Cinematic",
  minimal: "Minimal",
};
