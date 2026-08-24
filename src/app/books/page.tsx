import Link from "next/link";
import { featuredBooks } from "@/data/books";

export default function BooksPage() {
  return (
    <section aria-labelledby="books-title" className="space-y-10">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The library</p>
        <h1 id="books-title" className="text-4xl tracking-tight text-primary sm:text-5xl">Browse Books</h1>
        <p className="text-lg leading-8 text-muted">Explore the current BookVault collection while the full discovery experience takes shape.</p>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featuredBooks.map((book) => (
          <li key={book.id} className="rounded-card border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-accent">{book.genre}</p>
            <h2 className="mt-8 text-xl leading-tight text-primary">{book.title}</h2>
            <p className="mt-2 text-sm text-muted">{book.author}</p>
            <Link href={`/books/${book.id}`} className="mt-8 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">View Details</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
