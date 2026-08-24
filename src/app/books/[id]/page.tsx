import Link from "next/link";
import { notFound } from "next/navigation";
import { featuredBooks } from "@/data/books";

export function generateStaticParams() {
  return featuredBooks.map((book) => ({ id: String(book.id) }));
}

export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = featuredBooks.find((candidate) => candidate.id === Number(id));

  if (!book) {
    notFound();
  }

  return (
    <article aria-labelledby="book-details-title" className="mx-auto max-w-4xl space-y-8">
      <Link href="/books" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">Back to Books</Link>
      <div className="grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] md:items-start">
        <div className="flex aspect-[2/3] items-center justify-center rounded-card bg-primary text-7xl text-accent">{book.title.charAt(0)}</div>
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Book details</p>
            <h1 id="book-details-title" className="text-4xl leading-tight tracking-tight text-primary">{book.title}</h1>
            <p className="mt-3 text-lg text-muted">By {book.author}</p>
          </div>
          <p className="text-lg leading-8 text-muted">{book.description}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-border pt-5 text-sm">
            <dt className="font-semibold text-primary">Publication year</dt><dd>{book.publicationYear}</dd>
            <dt className="font-semibold text-primary">Genre</dt><dd>{book.genre}</dd>
          </dl>
        </div>
      </div>
    </article>
  );
}
