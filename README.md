# BookVault

A responsive React + TypeScript book discovery application built with Vite. BookVault lets users browse a curated set of books, search by title/author/genre, open book details, and save favorites locally in the browser.

> **Project type:** Frontend portfolio / internship assignment  
> **Stack:** React, TypeScript, Vite, React Router, CSS  
> **Data:** Local mock data  
> **Persistence:** Browser `localStorage`  
> **Backend/API:** None

## Features

- Responsive BookVault header with Home, Favorites, and search controls
- Hero section and Featured Books grid
- Reusable `BookCard` component
- Book Details route using `/books/:id`
- Graceful invalid-book state
- Search by:
  - title
  - author
  - genre
- Case-insensitive search
- URL-based search state, e.g. `/search?q=night`
- Search no-results state with query-aware messaging
- Clear Search navigation
- Favorites stored under `bookvault-favorites`
- Favorites persist after browser refresh
- Favorites page using the same shared `BookCard`
- Graceful handling of malformed favorite storage
- Accessible favorite controls with dynamic `aria-label` and `aria-pressed`
- Responsive desktop, tablet, and mobile layouts
- Semantic HTML and visible keyboard focus styling

## Tech Stack

- **React** — UI development
- **TypeScript** — static typing
- **Vite** — development server and production build
- **React Router** — client-side navigation
- **CSS3** — responsive styling and visual design
- **localStorage** — client-side favorite persistence

No UI framework, Firebase, authentication service, API package, or state-management library is required.

## Project Structure

```text
src/
├── components/
│   ├── BookCard/
│   └── Header/
├── data/
│   └── books.ts
├── hooks/
│   └── useFavorites.ts
├── pages/
│   ├── BookDetails/
│   ├── Favorites/
│   └── Home/
├── App.tsx
├── main.tsx
└── ...
```

The exact CSS files are kept close to their related components/pages to make the project easier to maintain.

## Routes

| Route | Purpose |
|---|---|
| `/` | Home page and Featured Books |
| `/search?q=...` | Search results |
| `/favorites` | Saved favorite books |
| `/books/:id` | Individual book details |

## Local Book Data

The application intentionally uses a single shared source of truth in `src/data/books.ts`.

Each book contains:

- `id`
- `title`
- `author`
- `coverImage`
- `description`
- `publicationYear`
- `genre`

There are exactly six mock books. Home, Search, Favorites, and Book Details all derive their book information from this shared data.

## Favorites

Favorite IDs are stored in:

```text
bookvault-favorites
```

The value is a JSON array of book IDs, for example:

```json
[1, 3]
```

The application safely falls back to an empty favorite list when stored data is malformed or unavailable.

## Getting Started

### Requirements

- Node.js
- npm

### Install

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

### Lint

```bash
npm run lint
```

### Production build

```bash
npm run build
```

## QA Summary

The completed application was tested across the main user flows.

### Functional checks

- Home loads correctly with all six books
- Search works by title, author, and genre
- Search is case-insensitive
- Search state is reflected in the URL
- No-results and Clear Search states work
- Book Details works for valid IDs
- Invalid IDs show a clear Book not found state
- Favorites can be added and removed
- Favorites persist after refresh
- Favorites appear on the Favorites page
- Removing the final favorite restores the empty state
- Malformed localStorage does not break the application

### Responsive checks

Tested approximately at:

- `1440px` desktop
- `768px` tablet
- `390px` mobile

No horizontal overflow was detected. The book grid uses three columns on desktop, two on tablet, and one on mobile.

### Build checks

```text
npm run lint  → PASS
npm run build → PASS
```

## Accessibility

The application uses:

- Semantic landmarks and headings
- Native links and buttons
- Accessible search labeling
- Keyboard-accessible controls
- Visible `:focus-visible` styles
- Meaningful image alternative text
- Dynamic favorite `aria-label`
- Dynamic favorite `aria-pressed`
- Clear empty/error states
- Responsive interactive target sizing

## Known Limitation

Book cover images are loaded from external image hosting. In the browser test environment, one external Unsplash image was blocked, but the application's existing fallback handling displayed correctly.

## AI-Assisted Development

AI was used as a development assistant through a staged prompt workflow. The project was built incrementally rather than generated as one large implementation.

The prompt sequence covered:

1. React/Vite/TypeScript initialization
2. Minimal cleanup
3. Header and routing
4. Home page and mock books
5. Favorites page shell
6. Reusable BookCard
7. Book Details
8. Navigation verification
9. Shared book data cleanup
10. Search
11. Search empty state
12. localStorage favorites
13. UX/reliability review
14. Accessibility review
15. Responsive review
16. Visual consistency review
17. Code quality review
18. Final QA

See `AI-ASSISTANCE.md` for the AI workflow and `MANUAL-IMPROVEMENTS.md` for the human review/refinement record.

## License

This project is intended as an educational/portfolio project.
