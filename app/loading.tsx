export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div
        className="h-6 w-6 rounded-full border border-verse-accent/30 border-t-verse-accent animate-spin"
        aria-label="Loading"
        role="status"
      />
    </main>
  );
}
