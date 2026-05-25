import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0E0E0E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontFamily: "serif",
            fontStyle: "italic",
            color: "#F5F1EA",
            lineHeight: 1,
            paddingBottom: 18,
          }}
        >
          V
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 50,
            width: 46,
            height: 3,
            background: "#D6B98C",
            borderRadius: 2,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
