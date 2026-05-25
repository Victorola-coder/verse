import "./global.css";
import Providers from "@/app/providers";
import { Cormorant_Garamond, Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  title: "Verse — Quotes as art",
  description:
    "A minimalist, cinematic space to create, share, and export beautiful quotes.",
  openGraph: {
    title: "Verse",
    description: "A digital mood and quote experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-verse-bg text-verse-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
