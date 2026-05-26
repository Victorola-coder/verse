import type { Metadata } from "next";
import SavedQuotes from "@/components/SavedQuotes";

export const metadata: Metadata = {
  title: "Saved quotes",
  description: "Your private collection of bookmarked quotes on Verse.",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <main className="min-h-[calc(100dvh-80px)] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 md:mb-12 text-center">
          <p className="font-sans text-xs text-verse-accent tracking-[0.3em] uppercase mb-4">
            Your library
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-verse-text font-light">
            Saved
          </h1>
          <p className="font-sans text-sm text-verse-muted mt-3 max-w-md mx-auto">
            The quotes you&rsquo;ve bookmarked. Visible only to you on this
            device.
          </p>
        </header>
        <SavedQuotes />
      </div>
    </main>
  );
}
