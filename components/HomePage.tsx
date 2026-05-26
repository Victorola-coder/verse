"use client";

import HeroSection from "@/components/HeroSection";
import FeaturedQuotes from "@/components/FeaturedQuotes";
import Categories from "@/components/Categories";
import QuoteFeed from "@/components/QuoteFeed";
import FeedControls from "@/components/FeedControls";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedQuotes />
      <Categories />
      <section
        id="feed"
        className="px-4 sm:px-6 py-16 sm:py-20 md:py-28 scroll-mt-20 sm:scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 md:mb-12 text-center">
            <p className="font-sans text-xs text-verse-accent tracking-[0.3em] uppercase mb-4">
              Discover
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-verse-text font-light">
              Quote Feed
            </h2>
          </header>
          <FeedControls />
          <QuoteFeed />
        </div>
      </section>
    </main>
  );
}
