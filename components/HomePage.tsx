"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedQuotes from "@/components/FeaturedQuotes";
import Categories from "@/components/Categories";
import QuoteFeed from "@/components/QuoteFeed";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedQuotes />
        <Categories />
        <section
          id="feed"
          className="px-4 sm:px-6 py-16 sm:py-20 md:py-28 scroll-mt-20 sm:scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto">
            <header className="mb-12 md:mb-16 text-center">
              <p className="font-sans text-xs text-verse-accent tracking-[0.3em] uppercase mb-4">
                Discover
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-verse-text font-light">
                Quote Feed
              </h2>
            </header>
            <QuoteFeed />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
