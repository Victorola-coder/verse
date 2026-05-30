// Pick a font-size for the quote based on length so long quotes still fit
// the canvas without overflow or clipping.
//
// Two surfaces share these brackets:
//   - QuoteCanvas (DOM)   — preview at any size + export at 1080x1350
//   - app/q/[id]/opengraph-image.tsx (Vercel OG) — 1200x630

export type QuoteSizeBracket = "xs" | "sm" | "md" | "lg" | "xl";

interface Bucket {
  bracket: QuoteSizeBracket;
  /** Used at 1080×1350 export canvas. */
  exportPx: number;
  /** Used at 1200×630 OG image. */
  ogPx: number;
  /** Tailwind responsive text utilities for the on-screen preview. */
  previewClass: string;
}

const BUCKETS: Bucket[] = [
  {
    bracket: "xl",
    exportPx: 96,
    ogPx: 76,
    previewClass: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  },
  {
    bracket: "lg",
    exportPx: 78,
    ogPx: 64,
    previewClass: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  },
  {
    bracket: "md",
    exportPx: 60,
    ogPx: 52,
    previewClass: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
  },
  {
    bracket: "sm",
    exportPx: 48,
    ogPx: 42,
    previewClass: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
  },
  {
    bracket: "xs",
    exportPx: 38,
    ogPx: 34,
    previewClass: "text-base sm:text-lg md:text-xl lg:text-2xl",
  },
];

// Length thresholds picked empirically against the 1080×1350 export canvas
// (max content width ~792px at p-24). A line at exportPx=72 fits ~22 chars,
// so these brackets target roughly 2 / 4 / 7 / 10 / 12+ lines respectively.
function pickBucket(text: string): Bucket {
  const len = text.trim().length;
  const longestWord = text
    .trim()
    .split(/\s+/)
    .reduce((max, word) => Math.max(max, word.length), 0);

  // A single very long word (URL, repeated chars) forces us to drop a tier
  // so that token has room to fit on one line.
  let bracketIndex: number;
  if (len <= 50) bracketIndex = 0;
  else if (len <= 110) bracketIndex = 1;
  else if (len <= 200) bracketIndex = 2;
  else if (len <= 320) bracketIndex = 3;
  else bracketIndex = 4;

  if (longestWord >= 20) bracketIndex = Math.min(BUCKETS.length - 1, bracketIndex + 1);
  if (longestWord >= 30) bracketIndex = Math.min(BUCKETS.length - 1, bracketIndex + 1);

  return BUCKETS[bracketIndex];
}

export function pickQuoteSize(text: string) {
  return pickBucket(text);
}
