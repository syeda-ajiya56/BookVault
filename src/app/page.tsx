import Link from "next/link";
import { featuredBooks } from "@/data/books";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-card bg-primary px-6 py-16 text-card sm:px-12 lg:px-20 lg:py-24">
        <div className="relative z-10 max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Your personal reading shelf</p>
          <h1 className="max-w-xl text-5xl leading-[1.05] tracking-tight sm:text-6xl">Discover Your Next Great Read</h1>
          <p className="max-w-lg text-lg leading-8 text-card/80">BookVault is a quiet place to discover remarkable books and build a reading life that feels entirely your own.</p>
          <Link href="/books" className="inline-flex rounded-md bg-accent px-5 py-3 font-semibold text-accent-foreground transition hover:bg-accent/85">Explore Books</Link>
        </div>
        <div aria-hidden="true" className="absolute -right-8 -bottom-20 hidden h-80 w-2/5 rotate-[-8deg] bg-accent/70 sm:block" />
      </section>

      <section aria-labelledby="featured-books-title" className="space-y-7">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">A considered collection</p>
            <h2 id="featured-books-title" className="text-3xl tracking-tight text-primary">Featured Books</h2>
          </div>
          <p className="max-w-xs text-sm text-muted">Six places to begin your next reading adventure.</p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredBooks.map((book) => (
            <li key={book.id} className="rounded-card border border-border bg-card p-5">
              <p className="mb-8 text-xs uppercase tracking-[0.16em] text-accent">{book.genre}</p>
              <h3 className="text-xl leading-tight text-primary">{book.title}</h3>
              <p className="mt-2 text-sm text-muted">{book.author}</p>
              <Link href={`/books/${book.id}`} className="mt-8 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">View Details</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
