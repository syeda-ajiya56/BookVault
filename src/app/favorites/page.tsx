import Link from "next/link";

export default function FavoritesPage() {
  return (
    <section aria-labelledby="favorites-title" className="mx-auto max-w-2xl space-y-5 py-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your reading shelf</p>
      <h1 id="favorites-title" className="text-4xl tracking-tight text-primary sm:text-5xl">Favorites</h1>
      <p className="text-lg leading-8 text-muted">Saved books will appear here when favorites are added in a later step.</p>
      <div className="rounded-card border border-border bg-card px-6 py-12">
        <h2 className="text-2xl text-primary">Your shelf is waiting</h2>
        <p className="mt-3 text-muted">Return to the library to keep exploring.</p>
        <Link href="/books" className="mt-7 inline-flex rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">Browse Books</Link>
      </div>
    </section>
  );
}
