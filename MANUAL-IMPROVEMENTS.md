# Manual Improvements & Human Review

## 1. Purpose

This document records the improvements that required review, judgment, validation, or refinement during the BookVault development process.

The goal was not to accept AI output blindly. The application was repeatedly checked against the assignment requirements and tested after changes.

## 2. Development Principle

The main review rule was:

> Make the smallest change that solves a real problem.

This kept the project focused and prevented later review prompts from turning into unnecessary redesigns.

## 3. Manual Review Areas

### 3.1 Scope Control

The project requirements explicitly excluded:

- Firebase
- authentication
- external book APIs
- UI component libraries
- state-management libraries
- unnecessary dependencies

These constraints were preserved throughout development.

The final application therefore remains a small frontend project using React, TypeScript, React Router, CSS, local mock data, and browser localStorage.

### 3.2 Shared Data

The book model was kept in one shared data source.

This avoids having Home and Book Details maintain separate copies of the same books.

The shared data includes:

```text
id
title
author
coverImage
description
publicationYear
genre
```

There are exactly six mock books.

### 3.3 Reusable BookCard

Book presentation was moved into a reusable BookCard component.

This improved consistency between:

- Home
- Search results
- Favorites

The card accepts explicit book information rather than knowing where the data came from.

### 3.4 Favorites State Ownership

A maintainability issue was identified during review.

Initially, multiple BookCard instances created their own favorites hook state while the Favorites page also maintained favorite state and refresh coordination.

This created unnecessary state ownership and synchronization complexity.

The final approach is:

```text
Home
 └── useFavorites()
      └── BookCard(s)

Favorites
 └── useFavorites()
      └── BookCard(s)
```

BookCard itself receives:

```text
isFavorite
onFavoriteToggle
```

This makes the component easier to reason about and keeps persistence logic outside the reusable presentation component.

### 3.5 Search

Search was intentionally implemented locally against the six shared books.

The search checks:

- title
- author
- genre

Matching is case-insensitive.

The query is represented in the URL so a search result can be refreshed or revisited without losing the search term.

Example:

```text
/search?q=night
```

### 3.6 Search Empty State

The no-results experience was checked to make sure the user is not left with a blank page.

The final state:

- explains that no books matched,
- includes the current query,
- provides Clear Search,
- returns the user to the normal Home/Featured Books state.

### 3.7 Favorites Persistence

Favorites use:

```text
localStorage key: bookvault-favorites
```

The application was manually/automatically tested for:

- adding a favorite,
- removing a favorite,
- refreshing the browser,
- displaying the favorite on Favorites,
- removing the final favorite,
- restoring the empty state.

Malformed storage was also tested.

Invalid JSON is handled safely instead of crashing the application.

### 3.8 Responsive Tablet Improvement

The initial grid used three columns at tablet width.

At approximately 768px, measurements showed the cards were unnecessarily narrow.

The grid was changed to:

```text
Desktop: 3 columns
Tablet: 2 columns
Mobile: 1 column
```

This was a targeted responsive improvement rather than a redesign.

### 3.9 Favorites Grid Width

The Favorites page originally inherited a narrower content constraint intended for readable text.

At 1440px, this resulted in favorite cards being much narrower than the Home cards.

The content/grid width was widened while the empty state remained constrained for readability.

This preserved the visual system without changing the page structure.

### 3.10 BookCard Action Hit Area

The “View Details” action was visually correct but had less vertical hit area than neighboring controls.

Small vertical padding was added to make the interactive area more consistent without changing the link's text-based visual style.

## 4. Accessibility Review

Accessibility was reviewed across the major interaction points.

The final implementation includes:

- semantic HTML
- heading hierarchy
- labeled search input
- native links and buttons
- keyboard-accessible interactions
- visible `:focus-visible` styles
- meaningful cover alt text
- dynamic favorite labels
- `aria-pressed` for favorite state
- clear empty/error messaging

No unnecessary ARIA patterns were added where native HTML already provided the correct semantics.

## 5. Responsive Review

The application was checked at approximately:

| Viewport | Expected grid | Result |
|---|---:|---|
| 1440px | 3 columns | Pass |
| 768px | 2 columns | Pass |
| 390px | 1 column | Pass |

Additional checks confirmed:

- no horizontal document overflow,
- usable header/search layout,
- responsive Book Details,
- contained book-cover images,
- usable interactive controls.

## 6. Final QA Evidence

The final QA checked:

### Home

- Hero renders
- Featured Books renders
- Six BookCards render

### Header

- BookVault branding
- Home navigation
- Favorites navigation
- Search input
- Search submission

### Search

- title search
- author search
- genre search
- case-insensitive matching
- URL query state
- matching results
- no-results state
- Clear Search

### Book Details

- valid `/books/:id`
- correct shared book data
- Back to Books
- invalid ID state

### Favorites

- add
- remove
- persistence
- Favorites page rendering
- empty state
- malformed localStorage recovery
- accessible favorite state

### Build

```text
npm run lint  → PASS
npm run build → PASS
```

## 7. Test-Environment Limitation

One external Unsplash cover image was blocked in the browser testing environment.

This was not treated as an application bug because the BookCard already provides fallback handling for failed cover images.

## 8. What Was Intentionally Not Changed

Several areas were reviewed and left unchanged because they already worked correctly:

- Header navigation
- React Router structure
- Home hero
- shared book data architecture
- Book Details routing
- search matching logic
- Favorites localStorage key
- existing empty states
- existing visual identity
- native semantic controls

Avoiding unnecessary changes was considered part of the quality of the implementation.

## 9. Final Assessment

The final application is intentionally small but demonstrates several important frontend skills:

- component reuse
- TypeScript typing
- client-side routing
- URL-driven state
- local persistence
- responsive CSS
- accessibility
- error/empty states
- maintainable state ownership
- incremental AI-assisted development
- testing and validation

The result is a focused portfolio project rather than an over-engineered application.
