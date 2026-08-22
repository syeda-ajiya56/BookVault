import BookCard from '../../components/BookCard'
import { featuredBooks } from '../../data/books'
import { useFavorites } from '../../hooks/useFavorites'
import { Link, useSearchParams } from 'react-router-dom'
import './Home.css'

function Home() {
  const { favoriteIds, toggleFavorite } = useFavorites()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.trim() ?? ''
  const normalizedQuery = searchQuery.toLocaleLowerCase()
  const displayedBooks = normalizedQuery
    ? featuredBooks.filter((book) =>
        [book.title, book.author, book.genre].some((field) =>
          field.toLocaleLowerCase().includes(normalizedQuery),
        ),
      )
    : featuredBooks
  const isSearchActive = Boolean(searchQuery)

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Your personal reading shelf</p>
          <h1 id="home-hero-title">Discover Your Next Great Read</h1>
          <p className="home-hero__description">
            BookVault helps you discover remarkable books and save the stories
            you want to return to.
          </p>
          <a className="home-hero__button" href="#featured-books">
            Explore Books
          </a>
        </div>
        <div className="home-hero__decoration" aria-hidden="true">
          <span className="home-hero__book home-hero__book--one" />
          <span className="home-hero__book home-hero__book--two" />
          <span className="home-hero__book home-hero__book--three" />
        </div>
      </section>

      <section
        className="featured-books"
        id="featured-books"
        aria-labelledby="books-section-title"
      >
        <div className="featured-books__heading">
          <div>
            <p className="section-eyebrow">
              {isSearchActive ? 'Search results' : 'Curated for you'}
            </p>
            <h2 id="books-section-title">
              {isSearchActive ? `Results for "${searchQuery}"` : 'Featured Books'}
            </h2>
          </div>
          <p>
            {isSearchActive
              ? `${displayedBooks.length} ${displayedBooks.length === 1 ? 'book' : 'books'} found.`
              : 'Six places to begin your next reading adventure.'}
          </p>
        </div>

        {displayedBooks.length > 0 ? (
          <ul
            className="book-grid"
            aria-label={isSearchActive ? 'Search results' : 'Featured books'}
          >
            {displayedBooks.map((book) => (
              <li className="book-grid__item" key={book.id}>
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
          <div className="book-grid__empty" role="status">
            <p>
              No books were found for <strong>"{searchQuery}"</strong>. Try a
              different title, author, or genre.
            </p>
            <Link className="book-grid__clear-link" to="/">
              Clear Search
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home