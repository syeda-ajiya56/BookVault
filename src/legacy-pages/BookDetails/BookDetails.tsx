import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { featuredBooks } from '../../data/books'
import './BookDetails.css'

function BookDetails() {
  const { bookId } = useParams<{ bookId: string }>()
  const [hasCoverError, setHasCoverError] = useState(false)
  const book = featuredBooks.find((candidate) => candidate.id === Number(bookId))

  if (!book) {
    return (
      <section className="book-details book-details--not-found" aria-labelledby="book-not-found-title">
        <div className="book-details__message">
          <p className="book-details__eyebrow">BookVault</p>
          <h1 id="book-not-found-title">Book not found</h1>
          <p>
            We could not find that book in the current collection. Return to
            the bookshelf to keep exploring.
          </p>
          <Link className="book-details__back-link" to="/">
            Back to Books
          </Link>
        </div>
      </section>
    )
  }

  return (
    <article className="book-details" aria-labelledby="book-details-title">
      <div className="book-details__inner">
        <Link className="book-details__back-link book-details__back-link--top" to="/">
          Back to Books
        </Link>
        <div className="book-details__layout">
          <div className="book-details__cover-wrapper">
            {hasCoverError ? (
              <div
                className="book-details__cover-fallback"
                role="img"
                aria-label={`No cover available for ${book.title}`}
              >
                <span>{book.title.charAt(0)}</span>
              </div>
            ) : (
              <img
                className="book-details__cover"
                src={book.coverImage}
                alt={`Cover of ${book.title}`}
                onError={() => setHasCoverError(true)}
              />
            )}
          </div>
          <div className="book-details__content">
            <p className="book-details__eyebrow">Book details</p>
            <h1 id="book-details-title">{book.title}</h1>
            <p className="book-details__author">By {book.author}</p>
            <p className="book-details__description">{book.description}</p>
            <dl className="book-details__publication">
              <dt>Publication year</dt>
              <dd>{book.publicationYear}</dd>
              <dt>Genre</dt>
              <dd>{book.genre}</dd>
            </dl>
          </div>
        </div>
      </div>
    </article>
  )
}

export default BookDetails