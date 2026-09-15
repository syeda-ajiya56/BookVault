type Book = {
  id: number
  title: string
  author: string
  coverImage: string
  description: string
  publicationYear: number
  genre: string
}

type Props = {
  query: string
  books: Book[]
}

export default function BookRecommendationCard({
  query,
  books,
}: Props) {
  if (books.length === 0) {
    return (
      <section className="book-tool-card" aria-label="Book search results">
        <div className="book-tool-card__header">
          <span className="book-tool-card__icon">📚</span>
          <div>
            <p className="book-tool-card__eyebrow">BookVault Search</p>
            <h2>No matching books</h2>
          </div>
        </div>

        <p className="book-tool-card__empty">
          I couldn&apos;t find a book matching &quot;{query}&quot;.
          Try another genre, mood, author, or topic.
        </p>
      </section>
    )
  }

  return (
    <section className="book-tool-card" aria-label="Book recommendations">
      <div className="book-tool-card__header">
        <span className="book-tool-card__icon">📚</span>

        <div>
          <p className="book-tool-card__eyebrow">BookVault Search</p>
          <h2>Recommendations for &quot;{query}&quot;</h2>
        </div>
      </div>

      <div className="book-tool-card__results">
        {books.map((book) => (
          <article className="book-tool-card__book" key={book.id}>
            <img
              src={book.coverImage}
              alt={`Cover of ${book.title}`}
              className="book-tool-card__cover"
            />

            <div className="book-tool-card__details">
              <div>
                <h3>{book.title}</h3>
                <p className="book-tool-card__author">
                  by {book.author}
                </p>
              </div>

              <span className="book-tool-card__genre">
                {book.genre}
              </span>

              <p className="book-tool-card__description">
                {book.description}
              </p>

              <p className="book-tool-card__year">
                Published {book.publicationYear}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}