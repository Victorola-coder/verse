import { ImageResponse } from "next/og";

export const alt = "Verse — a quiet place for words that move you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(214,185,140,0.10) 0%, #0E0E0E 65%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          color: "#F5F1EA",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "absolute",
            top: 60,
            left: 80,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#161616",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontStyle: "italic",
                lineHeight: 1,
                paddingBottom: 6,
              }}
            >
              V
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 14,
                width: 16,
                height: 2,
                background: "#D6B98C",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#9D9D9D",
              fontFamily: "sans-serif",
            }}
          >
            verse
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 92,
            fontStyle: "italic",
            fontWeight: 300,
            lineHeight: 1.15,
            textAlign: "center",
            maxWidth: 1000,
            letterSpacing: -2,
          }}
        >
          <span>Words that move you,</span>
          <span>made beautiful.</span>
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ width: 40, height: 1, background: "#D6B98C" }} />
          <div
            style={{
              fontSize: 22,
              color: "#D6B98C",
              letterSpacing: 4,
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            Create. Share. Inspire.
          </div>
          <div style={{ width: 40, height: 1, background: "#D6B98C" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
