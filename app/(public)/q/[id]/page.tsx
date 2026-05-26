import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import QuoteCanvas from "@/components/QuoteCanvas";
import QuoteActions from "@/components/QuoteActions";
import { getQuoteById } from "@/lib/services/quotes";
import { formatAuthorAttribution } from "@/utils/format-author";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) {
    return { title: "Quote not found" };
  }

  const author = formatAuthorAttribution(quote.author, quote.authorCasing);
  const snippet =
    quote.text.length > 140 ? `${quote.text.slice(0, 140)}…` : quote.text;
  const title = author ? `“${snippet}” — ${author}` : `“${snippet}”`;

  return {
    title,
    description: snippet,
    openGraph: {
      title,
      description: snippet,
      type: "article",
      url: `/q/${quote.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: snippet,
    },
  };
}

export default async function QuotePage({ params }: PageProps) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100dvh-80px)] pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-sans text-xs text-verse-muted uppercase tracking-widest mb-8 hover:text-verse-accent transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to feed
        </Link>

        <div className="rounded-2xl overflow-hidden verse-border">
          <QuoteCanvas
            text={quote.text}
            author={quote.author}
            theme={quote.theme}
            alignment={quote.alignment}
            backgroundImage={quote.backgroundImage}
            showQuoteMarks={quote.showQuoteMarks}
            authorCasing={quote.authorCasing}
          />
        </div>

        <QuoteActions quote={quote} />
      </div>
    </main>
  );
}
