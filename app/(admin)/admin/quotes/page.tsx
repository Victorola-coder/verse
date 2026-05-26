import AdminQuotes from "@/components/admin/AdminQuotes";

export const dynamic = "force-dynamic";

export default function AdminQuotesPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="font-serif text-3xl sm:text-4xl text-verse-text font-light">
          Quotes
        </h1>
        <p className="font-sans text-sm text-verse-muted">
          Edit, feature, or remove any published quote.
        </p>
      </header>
      <AdminQuotes />
    </main>
  );
}
