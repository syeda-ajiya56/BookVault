import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Book } from '../../data/books'
import './BookCard.css'

export type BookCardProps = Pick<Book, 'id' | 'title' | 'author' | 'coverImage'>
  & {
    isFavorite: boolean
    onFavoriteToggle: () => void
  }

function BookCard({
  id,
  title,
  author,
  coverImage,
  isFavorite,
  onFavoriteToggle,
}: BookCardProps) {
  const [hasCoverError, setHasCoverError] = useState(false)

  return (
    <article className="book-card" data-book-id={id}>
      <div className="book-card__cover-wrapper">
        {hasCoverError ? (
          <div
            className="book-card__cover-fallback"
            role="img"
            aria-label={`No cover available for ${title}`}
          >
            <span>{title.charAt(0)}</span>
          </div>
        ) : (
          <img
            className="book-card__cover"
            src={coverImage}
            alt={`Cover of ${title}`}
            onError={() => setHasCoverError(true)}
          />
        )}
        <button
          className="book-card__favorite"
          type="button"
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${title} from favorites`
              : `Add ${title} to favorites`
          }
          onClick={onFavoriteToggle}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="book-card__details">
        <h3>{title}</h3>
        <p>{author}</p>
        <Link className="book-card__details-link" to={`/books/${id}`}>
          View Details
        </Link>
      </div>
    </article>
  )
}

export default BookCard