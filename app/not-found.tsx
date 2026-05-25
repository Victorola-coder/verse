import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <p className="font-serif text-6xl text-verse-text opacity-40">404</p>
      <h1 className="font-serif text-2xl text-verse-text">Page not found</h1>
      <p className="font-sans text-sm text-verse-muted max-w-xs">
        This path doesn&apos;t exist. Return to the quiet.
      </p>
      <Link
        href="/"
        className="font-sans text-sm text-verse-accent border-b border-verse-accent/40 pb-0.5 transition-opacity duration-300 hover:opacity-70"
      >
        Back home
      </Link>
    </main>
  );
}
