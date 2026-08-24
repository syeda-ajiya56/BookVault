import Link from "next/link";

export default function BookNotFound() {
  return (
    <section aria-labelledby="book-not-found-title" className="mx-auto max-w-2xl space-y-5 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">BookVault</p>
      <h1 id="book-not-found-title" className="text-4xl tracking-tight text-primary">Book not found</h1>
      <p className="text-lg leading-8 text-muted">We could not find that book in the current collection.</p>
      <Link href="/books" className="inline-flex rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90">Back to Books</Link>
    </section>
  );
}
