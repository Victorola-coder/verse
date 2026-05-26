import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "You're offline",
  description: "Verse needs an internet connection for this page.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="min-h-[calc(100dvh-80px)] flex items-center justify-center px-4 sm:px-6 pt-24 pb-20">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-verse-card verse-border">
          <WifiOff className="h-7 w-7 text-verse-muted" />
        </div>

        <p className="font-sans text-xs text-verse-accent tracking-[0.3em] uppercase mb-4">
          No connection
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-verse-text font-light leading-tight mb-4">
          You&rsquo;re offline.
        </h1>
        <p className="font-sans text-sm text-verse-muted mb-10 leading-relaxed">
          Verse needs the internet to load fresh quotes. The pages you&rsquo;ve
          already opened in this session may still work.
        </p>

        <Link
          href="/"
          className="inline-block font-sans text-sm px-6 py-3 rounded-full bg-verse-accent text-verse-bg transition-all hover:opacity-90 hover:-translate-y-0.5"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
