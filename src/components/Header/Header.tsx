import type { FormEvent } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import './Header.css'

function Header() {
  const navigate = useNavigate()

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const query = formData.get('query')?.toString().trim() ?? ''

    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    } else {
      navigate('/')
    }
  }

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          BookVault
        </Link>

        <nav className="header__nav" aria-label="Main navigation">
          <ul className="header__nav-list">
            <li>
              <NavLink to="/" className="header__nav-link" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/favorites" className="header__nav-link">
                Favorites
              </NavLink>
            </li>
          </ul>
        </nav>

        <form
          className="header__search"
          role="search"
          aria-label="Search books"
          onSubmit={handleSearchSubmit}
        >
          <label htmlFor="header-search" className="header__search-label">
            Search books
          </label>
          <input
            id="header-search"
            className="header__search-input"
            type="search"
            name="query"
            placeholder="Search books..."
            autoComplete="off"
          />
          <button className="header__search-button" type="submit">
            Search
          </button>
        </form>
      </div>
    </header>
  )
}

export default Header
