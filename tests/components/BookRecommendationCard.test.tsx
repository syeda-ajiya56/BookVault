import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import BookRecommendationCard from '@/components/BookRecommendationCard'

afterEach(cleanup)

const recommendedBook = {
  id: 1,
  title: 'The Night Circus',
  author: 'Erin Morgenstern',
  coverImage: 'https://images.unsplash.com/night-circus',
  description: 'A mysterious competition unfolds beneath a black-and-white circus tent.',
  publicationYear: 2011,
  genre: 'Fantasy',
}

describe('BookRecommendationCard', () => {
  it('renders the accessible recommendations region for successful results', () => {
    render(
      <BookRecommendationCard query="magical stories" books={[recommendedBook]} />,
    )

    expect(screen.getByRole('region', { name: 'Book recommendations' })).toBeVisible()
  })

  it('renders a recommended book title and author', () => {
    render(
      <BookRecommendationCard query="magical stories" books={[recommendedBook]} />,
    )

    expect(screen.getByRole('heading', { name: recommendedBook.title })).toBeVisible()
    expect(screen.getByText(`by ${recommendedBook.author}`)).toBeVisible()
  })

  it('renders the provided book metadata and description', () => {
    render(
      <BookRecommendationCard query="magical stories" books={[recommendedBook]} />,
    )

    expect(screen.getByText(recommendedBook.genre)).toBeVisible()
    expect(screen.getByText(recommendedBook.description)).toBeVisible()
    expect(screen.getByText(`Published ${recommendedBook.publicationYear}`)).toBeVisible()
  })

  it('renders the accessible search results region and empty state when no books match', () => {
    render(<BookRecommendationCard query="underwater mysteries" books={[]} />)

    expect(screen.getByRole('region', { name: 'Book search results' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'No matching books' })).toBeVisible()
    expect(screen.getByText(/couldn't find a book matching/i)).toBeVisible()
    expect(screen.getByText(/Try another genre, mood, author, or topic/i)).toBeVisible()
  })
})
