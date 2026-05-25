export default function Footer() {
  return (
    <footer className="border-t border-verse py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-serif text-2xl text-verse-text">Verse</p>
          <p className="font-sans text-sm text-verse-muted mt-2">
            A digital mood and quote experience
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="font-sans text-xs text-verse-muted tracking-wider uppercase">
            © {new Date().getFullYear()} Verse
          </p>
          <p className="font-sans text-xs text-verse-muted">
            Built out of boredom by{" "}
            <a
              href="https://victorola.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-verse-accent hover:underline underline-offset-4 transition-colors"
            >
              VickyJay
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
