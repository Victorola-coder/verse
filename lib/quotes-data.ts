import type { QuoteCategory } from "@/types/quote";

export const CATEGORY_LABELS: Record<
  Exclude<QuoteCategory, "all">,
  string
> = {
  music: "Music",
  love: "Love",
  life: "Life",
  wisdom: "Wisdom",
  poetry: "Poetry",
};
