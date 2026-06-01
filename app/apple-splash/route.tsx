import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Dynamic Apple PWA splash screen.
// Reference as /apple-splash?w=1290&h=2796 — width/height come from the
// metadata.appleWebApp.startupImage entries in layout.tsx, one per device.

const DEFAULT_W = 1290;
const DEFAULT_H = 2796;
const MIN = 320;
const MAX = 4096;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const w = clamp(
    Number(searchParams.get("w") ?? DEFAULT_W) || DEFAULT_W,
    MIN,
    MAX
  );
  const h = clamp(
    Number(searchParams.get("h") ?? DEFAULT_H) || DEFAULT_H,
    MIN,
    MAX
  );

  // The mark scales with the shorter edge so it looks right on tall phones,
  // square iPads, and landscape orientations alike.
  const shortEdge = Math.min(w, h);
  const tileSize = Math.round(shortEdge * 0.28);
  const letterSize = Math.round(tileSize * 0.62);
  const accentWidth = Math.round(tileSize * 0.22);
  const radius = Math.round(tileSize * 0.22);
  const wordmarkSize = Math.round(shortEdge * 0.045);
  const wordmarkGap = Math.round(shortEdge * 0.05);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0E0E0E",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#F5F1EA",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            width: tileSize,
            height: tileSize,
            borderRadius: radius,
            background: "#161616",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: letterSize,
              fontStyle: "italic",
              lineHeight: 1,
              paddingBottom: Math.round(letterSize * 0.12),
            }}
          >
            V
          </div>
          <div
            style={{
              position: "absolute",
              bottom: Math.round(tileSize * 0.22),
              width: accentWidth,
              height: Math.max(2, Math.round(tileSize * 0.018)),
              background: "#D6B98C",
              borderRadius: 999,
            }}
          />
        </div>

        <div
          style={{
            marginTop: wordmarkGap,
            fontSize: wordmarkSize,
            letterSpacing: Math.round(wordmarkSize * 0.35),
            textTransform: "uppercase",
            color: "#9D9D9D",
            fontFamily: "sans-serif",
          }}
        >
          verse
        </div>
      </div>
    ),
    {
      width: w,
      height: h,
      headers: {
        // Long-cache: the splash never changes for a given size.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
