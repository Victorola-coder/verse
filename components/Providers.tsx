"use client";

import { QuoteProvider } from "@/lib/quote-context";
import CreateQuoteModal from "@/components/CreateQuoteModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QuoteProvider>
      {children}
      <CreateQuoteModal />
    </QuoteProvider>
  );
}
