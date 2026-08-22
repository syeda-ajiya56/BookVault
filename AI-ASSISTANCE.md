# AI Assistance Documentation

## 1. Purpose

BookVault was developed with AI used as a **development assistant**, not as a replacement for review, testing, or engineering judgment.

The project was built through a sequence of focused prompts. Each prompt had a limited scope and explicitly protected existing functionality. After implementation, the application was reviewed through linting, production builds, browser checks, responsive measurements, accessibility checks, and final QA.

This document records how AI contributed to the project and how its output was evaluated.

## 2. Development Approach

The development process followed an incremental workflow:

```text
Initialize
   ↓
Clean starting point
   ↓
Header + routing
   ↓
Home + mock data
   ↓
Favorites page shell
   ↓
Reusable BookCard
   ↓
Book Details
   ↓
Shared data architecture
   ↓
Search
   ↓
Favorites persistence
   ↓
UX review
   ↓
Accessibility review
   ↓
Responsive review
   ↓
Visual consistency review
   ↓
Code quality review
   ↓
Final QA
```

The prompts deliberately avoided adding backend services, APIs, Firebase, authentication, or unnecessary dependencies.

## 3. Prompt Strategy

The prompts were written to make AI work in small, verifiable steps.

Important patterns used throughout the prompts:

- **Scope control:** “Do not modify unrelated parts.”
- **Preservation:** existing routing, data, UI, and working features were protected.
- **No unnecessary dependencies:** UI libraries, Firebase, API packages, and state-management libraries were excluded.
- **Verification:** most implementation prompts ended with lint/build requirements.
- **Review before editing:** later prompts explicitly required inspection before changes.
- **Minimal changes:** AI was instructed to leave correct implementation unchanged.
- **Regression prevention:** QA prompts tested previously completed flows after later refactoring.

## 4. Prompt Sequence

### Prompts 01–02 — Foundation

AI initialized the Vite React TypeScript application and then removed default/demo content.

Goal: establish a clean starting point before adding application features.

### Prompt 03 — Header and Routing

AI created the reusable Header and configured React Router.

Goal: establish the main navigation structure without prematurely building pages or backend functionality.

### Prompt 04 — Home

AI created the Home page and six-book local mock dataset.

A TypeScript build issue involving `FormEvent` was then fixed with a type-only import. The requested behavior and styling were intentionally left unchanged.

### Prompt 05 — Favorites Shell

AI created the Favorites page as an empty state only.

Goal: establish the route and page structure before implementing persistence.

### Prompt 06 — BookCard

AI extracted the repeated book presentation into a reusable BookCard component and updated Home to use it.

Goal: reduce duplicated markup and establish a reusable UI boundary.

### Prompt 07 — Book Details

AI created dynamic Book Details using `useParams` and the existing shared book data.

Goal: demonstrate reusable data, dynamic routing, and graceful invalid-ID handling.

### Prompt 08 — Navigation Verification

Instead of rebuilding Book Details, AI was instructed to verify the existing navigation.

Goal: prevent duplicate components/routes and reinforce review-before-editing.

### Prompt 09 — Shared Data Review

AI reviewed `src/data/books.ts`, Home, BookCard, and Book Details to ensure one shared Book type and one shared six-book array.

Goal: maintain a single source of truth.

### Prompts 10–11 — Search

AI implemented local search using React Router query parameters and then improved the no-results state.

Search was kept local and based on the existing six books.

### Prompt 12 — Favorites

AI implemented browser `localStorage` persistence under:

```text
bookvault-favorites
```

The Favorites page reused BookCard and shared book data.

### Prompts 13–17 — Review and Refinement

AI was used for focused reviews rather than feature generation:

- UX/reliability
- accessibility
- responsive design
- visual consistency
- code quality/maintainability

Each review explicitly required AI to make changes only when a concrete issue existed.

### Prompt 18 — Final QA

AI tested the complete application as an integrated system.

The QA included routes, search, favorites, invalid states, malformed storage, responsive viewports, accessibility-related attributes, lint, and production build.

## 5. How AI Was Used

AI contributed to:

- React component scaffolding
- TypeScript implementation
- React Router setup and navigation
- CSS organization and responsive rules
- Search implementation
- localStorage persistence
- Accessibility attributes
- Refactoring suggestions
- Test planning and browser verification
- Documentation structure

AI did **not** independently decide that every generated change should be accepted. Changes were reviewed against the assignment requirements and existing behavior.

## 6. Human Oversight

Human review remained important throughout the process.

The development workflow used the following rule:

> If the existing implementation already satisfies a requirement, do not change it just to make a change.

This prevented unnecessary rewrites during the later review stages.

The application was also validated with:

```bash
npm run lint
npm run build
```

and browser-based functional checks.

## 7. Examples of AI Decisions That Were Accepted

### Shared favorite state

During the code-quality review, each BookCard originally created its own favorites hook while Favorites also maintained separate favorite state.

AI identified this as unnecessary duplicated state ownership.

The accepted refactor moved favorite state ownership to the page level:

- Home owns one favorites hook instance.
- Favorites owns one favorites hook instance.
- BookCard receives `isFavorite` and `onFavoriteToggle`.

This makes BookCard a simpler presentation/interaction component.

### Responsive tablet grid

Testing showed that three book columns at approximately 768px made cards unnecessarily narrow.

AI proposed a two-column tablet breakpoint while preserving:

- three columns on desktop
- one column on mobile

This was accepted because the change was supported by an actual layout measurement.

### Favorites desktop width

A later visual review measured Favorites cards at roughly 208px wide at 1440px because the grid was constrained by a narrow text container.

AI widened the Favorites content area so the cards followed the broader BookVault content rhythm.

## 8. Validation Philosophy

AI-generated code was treated as a draft until validated.

The project used:

- static linting
- production builds
- route checks
- search checks
- favorites persistence checks
- malformed localStorage checks
- responsive measurements
- accessibility assertions
- final integration QA

The final QA found no functional bugs requiring correction.

## 9. Limitations of AI Assistance

AI can produce code that appears correct while still containing:

- incorrect assumptions about existing files
- unnecessary abstractions
- subtle state synchronization problems
- accessibility omissions
- responsive layout issues
- test-environment-specific failures

For that reason, the project workflow repeatedly instructed AI to inspect the current implementation and validate changes instead of blindly recreating features.

## 10. Summary

AI accelerated implementation, refactoring, testing, and documentation, while the project remained intentionally constrained and review-driven.

The strongest use of AI in this project was not simply generating code. It was using focused prompts to:

1. build incrementally,
2. inspect before editing,
3. justify changes,
4. test behavior,
5. catch maintainability issues,
6. and avoid unnecessary rewrites.
