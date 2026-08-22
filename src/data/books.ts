export interface Book {
  id: number
  title: string
  author: string
  coverImage: string
  description: string
  publicationYear: number
  genre: string
}

export const featuredBooks: Book[] = [
  {
    id: 1,
    title: 'The Night Circus',
    author: 'Erin Morgenstern',
    coverImage:
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=480&q=80',
    description:
      'A spellbinding story of two young magicians whose rivalry unfolds inside a mysterious traveling circus.',
    publicationYear: 2011,
    genre: 'Historical fantasy',
  },
  {
    id: 2,
    title: 'The Shadow of the Wind',
    author: 'Carlos Ruiz Zafon',
    coverImage:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=480&q=80',
    description:
      'A boy discovers a forgotten author and is drawn into a captivating mystery about books, secrets, and memory.',
    publicationYear: 2001,
    genre: 'Historical mystery',
  },
  {
    id: 3,
    title: 'Piranesi',
    author: 'Susanna Clarke',
    coverImage:
      'https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=480&q=80',
    description:
      'An atmospheric tale of wonder and discovery set in an endless house filled with statues, tides, and hidden truths.',
    publicationYear: 2020,
    genre: 'Literary fantasy',
  },
  {
    id: 4,
    title: 'A Gentleman in Moscow',
    author: 'Amor Towles',
    coverImage:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=480&q=80',
    description:
      'A count sentenced to house arrest in a grand hotel builds an extraordinary life within the walls around him.',
    publicationYear: 2016,
    genre: 'Historical fiction',
  },
  {
    id: 5,
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    coverImage:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=480&q=80',
    description:
      'A lyrical retelling of the bond between Achilles and Patroclus, set against the glory and tragedy of the Trojan War.',
    publicationYear: 2011,
    genre: 'Historical fiction',
  },
  {
    id: 6,
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    coverImage:
      'https://images.unsplash.com/photo-1516979187457-637e4a2c7a4b?auto=format&fit=crop&w=480&q=80',
    description:
      'Two friends create worlds together through video games while navigating ambition, creativity, love, and loss.',
    publicationYear: 2022,
    genre: 'Contemporary fiction',
  },
]