import { z } from 'zod'
import { featuredBooks } from '@/data/books'

export const searchBooksInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(100)
    .describe('The mood, genre, author, or topic the reader is looking for.'),
})

export type SearchBooksInput = z.infer<typeof searchBooksInputSchema>

export type SearchBooksResult = {
  books: Array<{
    id: number
    title: string
    author: string
    coverImage: string
    description: string
    publicationYear: number
    genre: string
  }>
  query: string
}

export const searchBooksTool = {
  name: 'searchBooks',
  description:
    'Search BookVault books by genre, mood, author, title, or topic and return matching books.',
  inputSchema: searchBooksInputSchema,

  async execute(input: SearchBooksInput): Promise<SearchBooksResult> {
    const query = input.query.trim().toLowerCase()

    if (!query) {
      throw new Error('Please provide a book search query.')
    }

    const searchTerms = query
      .split(/\s+/)
      .filter((term) => term.length > 2)

    const books = featuredBooks
      .map((book) => {
        const searchableText = [
          book.title,
          book.author,
          book.description,
          book.genre,
        ]
          .join(' ')
          .toLowerCase()

        const score = searchTerms.reduce(
          (total, term) => total + (searchableText.includes(term) ? 1 : 0),
          0,
        )

        return { book, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ book }) => book)

    return {
      query: input.query,
      books,
    }
  },
}