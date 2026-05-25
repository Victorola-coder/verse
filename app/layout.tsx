import "./global.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Cormorant_Garamond, Inter } from "next/font/google";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verse.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Verse — Words that move you, made beautiful",
    template: "%s · Verse",
  },
  description:
    "A minimalist, cinematic space to create, share, and export beautiful quotes.",
  applicationName: "Verse",
  keywords: [
    "quotes",
    "quote maker",
    "share quotes",
    "quote images",
    "inspiration",
    "literature",
  ],
  authors: [{ name: "VickyJay", url: "https://victorola.dev" }],
  creator: "VickyJay",
  openGraph: {
    title: "Verse — Words that move you, made beautiful",
    description:
      "Create, share, and export beautiful quotes. A digital mood and quote experience.",
    url: siteUrl,
    siteName: "Verse",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verse — Words that move you, made beautiful",
    description:
      "Create, share, and export beautiful quotes. A digital mood and quote experience.",
    creator: "@vickyjay",
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
