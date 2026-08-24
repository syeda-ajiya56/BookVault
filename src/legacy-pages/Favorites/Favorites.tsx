import { Link } from 'react-router-dom'
import BookCard from '../../components/BookCard'
import { featuredBooks } from '../../data/books'
import { useFavorites } from '../../hooks/useFavorites'
import './Favorites.css'

function Favorites() {
  const { favoriteIds, toggleFavorite } = useFavorites()
  const favoriteBooks = featuredBooks.filter((book) => favoriteIds.includes(book.id))

  return (
    <section className="favorites-page" aria-labelledby="favorites-title">
      <div className="favorites-page__content">
        <p className="favorites-page__eyebrow">Your reading list</p>
        <h1 id="favorites-title">My Favorites</h1>
        <p className="favorites-page__description">
          Books you save will appear here, ready whenever you are looking for
          your next read.
        </p>

        {favoriteBooks.length > 0 ? (
          <ul className="favorites-book-grid" aria-label="Favorite books">
            {favoriteBooks.map((book) => (
              <li key={book.id}>
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  coverImage={book.coverImage}
                  isFavorite={favoriteIds.includes(book.id)}
                  onFavoriteToggle={() => toggleFavorite(book.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="favorites-empty-state" role="status">
            <div className="favorites-empty-state__icon" aria-hidden="true">
              <span>♡</span>
            </div>
            <h2>Your favorites shelf is waiting</h2>
            <p>
              Explore BookVault and start building a collection of stories you
              want to remember.
            </p>
            <Link className="favorites-empty-state__link" to="/">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default Favorites