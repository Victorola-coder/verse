import { ImageResponse } from "next/og";
import { getQuoteById } from "@/lib/services/quotes";
import { THEME_STYLES } from "@/lib/themes";
import { formatAuthorAttribution } from "@/utils/format-author";
import { pickQuoteSize } from "@/utils/quote-typography";

export const alt = "Quote on Verse";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function QuoteOgImage({ params }: Params) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0E0E0E",
            color: "#F5F1EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "serif",
            fontSize: 56,
            fontStyle: "italic",
          }}
        >
          Quote not found
        </div>
      ),
      { ...size }
    );
  }

  const theme = THEME_STYLES[quote.theme];
  const author = formatAuthorAttribution(quote.author, quote.authorCasing);
  const isLightTheme = quote.theme === "beige";
  const sized = pickQuoteSize(quote.text);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 90,
          background: isLightTheme
            ? theme.background
            : `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(214,185,140,0.10) 0%, ${theme.background.includes("gradient") ? "#0E0E0E" : theme.background} 70%)`,
          color: theme.text,
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {quote.backgroundImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={quote.backgroundImage}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: theme.overlay ?? "rgba(0,0,0,0.55)",
              }}
            />
          </>
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              color: theme.muted,
              fontStyle: "italic",
              opacity: 0.45,
              marginBottom: -10,
            }}
          >
            “
          </div>

          <div
            style={{
              fontSize: sized.ogPx,
              lineHeight: 1.25,
              fontStyle: "italic",
              fontWeight: 300,
              letterSpacing: -1,
              color: theme.text,
              maxWidth: 1000,
              overflowWrap: "anywhere",
            }}
          >
            {quote.text}
          </div>

          {author && (
            <div
              style={{
                marginTop: 40,
                fontSize: 24,
                color: theme.accent,
                letterSpacing: 6,
                textTransform: "uppercase",
                fontFamily: "sans-serif",
              }}
            >
              — {author}
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            color: theme.muted,
            opacity: 0.6,
            fontSize: 16,
            letterSpacing: 10,
            textTransform: "uppercase",
            fontFamily: "sans-serif",
          }}
        >
          verse
        </div>
      </div>
    ),
    { ...size }
  );
}
