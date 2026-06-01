import "./global.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Cormorant_Garamond, Inter } from "next/font/google";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import SplashOverlay from "@/components/SplashOverlay";

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
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://verse.victorola.dev";

// Common Apple device portrait splash sizes. Each entry's `url` points at the
// dynamic /apple-splash route which renders a centred V mark at that exact
// pixel size. Landscape variants reuse the same route with swapped w/h.
const APPLE_SPLASH = [
  // iPhone 14/15 Pro Max
  { w: 1290, h: 2796, dw: 430, dh: 932, dpr: 3 },
  // iPhone 14/15 Pro
  { w: 1179, h: 2556, dw: 393, dh: 852, dpr: 3 },
  // iPhone 14 Plus / 13–12 Pro Max
  { w: 1284, h: 2778, dw: 428, dh: 926, dpr: 3 },
  // iPhone 14/13/12 (Pro)
  { w: 1170, h: 2532, dw: 390, dh: 844, dpr: 3 },
  // iPhone 13/12 mini
  { w: 1080, h: 2340, dw: 360, dh: 780, dpr: 3 },
  // iPhone 11 Pro Max / XS Max
  { w: 1242, h: 2688, dw: 414, dh: 896, dpr: 3 },
  // iPhone 11 Pro / XS / X
  { w: 1125, h: 2436, dw: 375, dh: 812, dpr: 3 },
  // iPhone 11 / XR
  { w: 828, h: 1792, dw: 414, dh: 896, dpr: 2 },
  // iPhone 8 Plus / 7 Plus / 6 Plus
  { w: 1242, h: 2208, dw: 414, dh: 736, dpr: 3 },
  // iPhone 8 / 7 / 6 / SE2/3
  { w: 750, h: 1334, dw: 375, dh: 667, dpr: 2 },
  // iPhone SE 1st-gen / 5s
  { w: 640, h: 1136, dw: 320, dh: 568, dpr: 2 },
  // iPad Pro 12.9"
  { w: 2048, h: 2732, dw: 1024, dh: 1366, dpr: 2 },
  // iPad Pro 11"
  { w: 1668, h: 2388, dw: 834, dh: 1194, dpr: 2 },
  // iPad Air / iPad 10.2"
  { w: 1620, h: 2160, dw: 810, dh: 1080, dpr: 2 },
  // iPad mini / iPad 9.7"
  { w: 1536, h: 2048, dw: 768, dh: 1024, dpr: 2 },
] as const;

const startupImages = APPLE_SPLASH.flatMap((d) => [
  {
    url: `/apple-splash?w=${d.w}&h=${d.h}`,
    media: `(device-width: ${d.dw}px) and (device-height: ${d.dh}px) and (-webkit-device-pixel-ratio: ${d.dpr}) and (orientation: portrait)`,
  },
  {
    url: `/apple-splash?w=${d.h}&h=${d.w}`,
    media: `(device-width: ${d.dw}px) and (device-height: ${d.dh}px) and (-webkit-device-pixel-ratio: ${d.dpr}) and (orientation: landscape)`,
  },
]);

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
  appleWebApp: {
    capable: true,
    title: "Verse",
    statusBarStyle: "black-translucent",
    startupImage: startupImages,
  },
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
  other: {
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
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
        <SplashOverlay />
        {children}
        <ServiceWorkerRegistration />
        <Analytics />
      </body>
    </html>
  );
}
