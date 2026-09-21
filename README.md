# BookVault

BookVault is a modern digital library experience for discovering books, exploring book details, building reading lists, and getting AI-powered recommendations.

The project evolved from a Next.js App Router foundation into a production-deployed capstone with streaming AI chat, generative book search, an interactive 3D book viewer, a custom shader hero, automated testing, CI, accessibility improvements, and production hardening.

## Live Demo

**Production:** https://book-vault-ecru.vercel.app/

**Repository:** https://github.com/syeda-ajiya56/BookVault

---

## What BookVault Does

BookVault provides a focused digital-library experience where users can:

* Browse a curated book collection.
* Open individual book detail pages.
* Explore favorites and reading-list experiences.
* Ask an AI reading assistant for recommendations.
* Search the BookVault catalog through an AI tool.
* Interact with a 3D book viewer.
* Customize the 3D book cover and material.
* Use the experience across desktop and mobile layouts.

The current catalog uses local mock book data. Authentication and a persistent database are intentionally not part of the current implementation.

---

## Screenshots

Add screenshots from the production site here.

Recommended screenshots:

1. Home / shader hero
2. Book collection
3. AI chat with generated book recommendations
4. 3D book viewer
5. Mobile responsive view
6. Button state demo

Example:

```text
docs/screenshots/home.png
docs/screenshots/books.png
docs/screenshots/ai-search.png
docs/screenshots/3d-viewer.png
docs/screenshots/mobile.png
```

---

## Features

### Book Discovery

* Curated local book catalog.
* Book collection page.
* Individual book detail routes.
* Featured books on the home page.
* Favorites and reading-list experiences.

### AI Reading Assistant

* Streaming AI responses.
* Multi-turn conversations.
* Stop-generation support.
* Preserves text already received when generation is stopped.
* Server-side API key handling.
* AI-powered book recommendations.
* Generative search through the BookVault catalog.

### Interactive 3D Viewer

The `/3d` route uses React Three Fiber and Three.js to create an interactive BookVault book.

Users can:

* Orbit and zoom with pointer or touch controls.
* Change the cover between Burgundy, Navy, and Forest.
* Switch between Matte and Glossy materials.
* Open and close the book.
* Enable or disable automatic rotation.

### Custom Shader Hero

The home page includes a custom WebGL fragment-shader hero using:

* `u_time`
* `u_resolution`
* `u_mouse`

The implementation accounts for device pixel ratio and animation lifecycle so the effect does not continuously consume resources when the page is hidden.

A reduced-motion/static fallback is provided for users who prefer less animation or environments where WebGL is unavailable.

### Stateful UI

The `/button-demo` route demonstrates a stateful interaction lifecycle:

* Idle
* Loading
* Success
* Error
* Disabled

The implementation also respects reduced-motion preferences.

---

## Tech Stack

| Technology            | Purpose                        |
| --------------------- | ------------------------------ |
| Next.js 16            | Application framework          |
| React 19              | UI                             |
| TypeScript            | Type safety                    |
| Tailwind CSS          | Styling                        |
| Three.js              | 3D rendering                   |
| React Three Fiber     | React integration for Three.js |
| React Three Drei      | 3D controls and helpers        |
| OpenRouter            | AI model access                |
| Zod                   | Tool input validation          |
| Vitest                | Unit/component testing         |
| React Testing Library | UI testing                     |
| Playwright            | End-to-end testing             |
| GitHub Actions        | Continuous integration         |
| Vercel                | Production deployment          |

---

## Routes

| Route           | Purpose                                 |
| --------------- | --------------------------------------- |
| `/`             | Home page and featured collection       |
| `/books`        | Book collection                         |
| `/books/[id]`   | Individual book details                 |
| `/favorites`    | Favorites experience                    |
| `/reading-list` | Reading-list experience                 |
| `/about`        | About BookVault                         |
| `/ask-ai`       | AI reading assistant                    |
| `/3d`           | Interactive 3D book viewer              |
| `/button-demo`  | Stateful button lifecycle demonstration |
| `/health`       | Server health-check endpoint            |

---

# AI Architecture

BookVault's AI functionality is implemented as a server-side streaming workflow rather than exposing the provider API key to the browser.

## Request Flow

```text
User
  │
  ▼
/ask-ai
  │
  ▼
BookVaultAI.tsx
  │
  ▼
/api/chat
  │
  ├── Validate messages
  │
  ├── Enforce input limits
  │
  ▼
OpenRouter
  │
  ├── Normal response
  │
  └── Tool request
          │
          ▼
     searchBooks
          │
          ▼
     Local book catalog
          │
          ▼
     Book recommendation results
          │
          ▼
     OpenRouter follow-up
          │
          ▼
     Streaming response
          │
          ▼
     BookVaultAI UI
```

The browser communicates with the BookVault server route. The OpenRouter API key remains server-side.

---

# AI Streaming Chat

The AI reading assistant is available at `/ask-ai`.

The implementation supports:

* Progressive streaming responses.
* Multiple conversation turns.
* Cancellation/stopping of generation.
* Preserving already streamed text.
* Tool calls for book discovery.
* Error handling and fallback states.

Relevant files:

```text
src/lib/ai.ts
src/app/api/chat/route.ts
src/components/BookVaultAI.tsx
src/components/BookVaultAI.css
```

`src/lib/ai.ts` contains the OpenRouter configuration and BookVault AI system instructions.

`src/app/api/chat/route.ts` handles the server-side request and streaming workflow.

`BookVaultAI.tsx` contains the client-side chat experience and streaming states.

---

# AI Tool: searchBooks

BookVault AI includes a server-side generative search tool called `searchBooks`.

The tool searches the local BookVault catalog using information such as:

* Mood
* Genre
* Author
* Title
* Topic

## Input Schema

```ts
{
  query: string
}
```

The query is validated with Zod and must contain between 1 and 100 characters.

## Return Shape

```ts
{
  query: string,
  books: [
    {
      id: number,
      title: string,
      author: string,
      coverImage: string,
      description: string,
      publicationYear: number,
      genre: string
    }
  ]
}
```

The tool returns up to three matching books.

Relevant implementation:

```text
src/lib/searchBooks.ts
```

## Tool Lifecycle

The UI handles the tool lifecycle through these states:

* `input-streaming` — tool arguments are being streamed.
* `input-available` — complete tool input is available.
* `output-available` — the tool returned book results.
* `output-error` — the tool failed and an error state is displayed.

Generated results are displayed through the reusable:

```text
BookRecommendationCard
```

component.

---

# Production Hardening

The AI route includes input protections to reduce trivial abuse and prevent unnecessarily large requests.

The server enforces:

* Maximum of 20 messages per request.
* Maximum of 2,000 characters per individual message.
* Maximum of 10,000 characters across the complete input.
* Maximum streaming duration of 60 seconds.
* Message role validation.
* Message content validation.

The route also handles:

* Missing API configuration.
* Invalid request bodies.
* Aborted requests.
* Tool execution failures.
* Upstream API errors.

The OpenRouter API key is never exposed through client-side environment variables.

---

# Environment Variables

Create a `.env.local` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

| Variable             | Required   | Purpose                               |
| -------------------- | ---------- | ------------------------------------- |
| `OPENROUTER_API_KEY` | Yes for AI | Server-side OpenRouter authentication |

Do **not** use:

```text
NEXT_PUBLIC_OPENROUTER_API_KEY
VITE_OPENROUTER_API_KEY
```

The API key must remain server-side.

For production, configure the variable through the Vercel project's environment settings.

---

# 3D Experience

The `/3d` route provides an interactive book viewer built with React Three Fiber, Three.js, and Drei.

## Performance / Rendering

The production 3D implementation was checked for:

* Initial server-rendered HTML.
* Lazy loading of the 3D viewer.
* Responsive canvas sizing.
* Mobile rendering.
* Desktop rendering.
* Frame-rate behavior.
* Reduced-motion behavior.
* WebGL fallback behavior.

Observed measurements during the production check included approximately:

* Desktop canvas: `1199 × 619` CSS pixels at a 1280px viewport.
* Mobile canvas: `319 × 359` CSS pixels at a 375px viewport.
* Approximately 61 FPS during tested mobile and desktop interactions.

The scene uses lightweight procedural geometry instead of a heavy external 3D model.

A loading placeholder is displayed while the viewer initializes to reduce layout shift.

## Responsible Shipping

The 3D experience includes:

* Static HTML/CSS fallback when WebGL is unavailable.
* Save-Data-aware fallback behavior.
* Reduced-motion handling.
* Responsive touch controls.
* Mobile-friendly controls.
* Lazy loading.

Potential future improvements include a more detailed optimized GLB model and broader physical-device GPU profiling.

---

# Accessibility and Performance

BookVault was audited for accessibility and performance during the project.

The final Lighthouse measurements recorded during the audit were:

* Performance: **92**
* Accessibility: **100**

WAVE testing across the checked pages reported:

* 0 accessibility errors.
* 0 contrast errors.
* 1 redundant-link alert.

Accessibility improvements included:

* Improved color contrast.
* Accessible interactive states.
* Reduced-motion support.
* Responsive controls.
* Fallback experiences for WebGL-dependent content.

The project also uses explicit design tokens for colors, borders, backgrounds, and accessible foreground combinations.

---

# Testing

BookVault includes automated component and end-to-end testing.

## Test Stack

* Vitest
* React Testing Library
* Playwright
* GitHub Actions

The component test suite covers meaningful UI behavior rather than depending on implementation-specific CSS class names.

The AI chat is tested across important states including:

* Pending
* Streaming
* Error

A Playwright test covers the primary application flow.

## Coverage Evidence

The latest local coverage run completed successfully with:

- 12 tests passed.
- 2 test files passed.
- 76.03% statement coverage.
- 57.77% branch coverage.
- 78.57% function coverage.
- 79.82% line coverage.

Coverage was generated with Vitest and the V8 coverage provider.

The coverage output is generated locally and is excluded from Git through `.gitignore`.

## Continuous Integration

GitHub Actions runs the automated test suite on pushes to the repository.

The CI configuration is located at:

```text
.github/workflows/tests.yml
```

The final CI configuration separates Vitest component tests from Playwright end-to-end specifications.

---

# Development Setup

## Requirements

* Node.js
* npm
* An OpenRouter API key for AI functionality

## Installation

Clone the repository:

```bash
git clone https://github.com/syeda-ajiya56/BookVault.git
cd BookVault
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

Run:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

---

# Project Structure

```text
src/
├── app/
│   ├── page.tsx
│   ├── books/
│   ├── favorites/
│   ├── reading-list/
│   ├── about/
│   ├── ask-ai/
│   ├── 3d/
│   ├── button-demo/
│   ├── health/
│   └── api/
│       └── chat/
│
├── components/
│   ├── BookVaultAI.tsx
│   ├── BookRecommendationCard.tsx
│   ├── StatefulButton.tsx
│   └── ...
│
├── data/
│   └── books.ts
│
├── hooks/
│
├── lib/
│   ├── ai.ts
│   └── searchBooks.ts
│
├── shaders/
│
└── legacy-pages/
    └── ...
```

The active application uses the Next.js App Router under `src/app`.

The previous Vite/React Router implementation is preserved under `src/legacy-pages` for reference. The obsolete root `src/App.tsx` entry point was removed after migration so that the active Next.js architecture is not confused with the legacy application.

---

# Important Technical Decisions

### Next.js App Router

The project uses the Next.js App Router with Server Components by default. This keeps server-rendered content separate from client-side interactive features.

### Server-Side AI

The OpenRouter integration is handled through `/api/chat` rather than exposing credentials in browser code.

### Local Catalog

Book data remains local and deterministic for the current capstone. This keeps the recommendation tool simple and reproducible without requiring a database.

### Zod Validation

The AI book-search tool validates its input before searching the catalog.

### Progressive Enhancement

Interactive 3D and shader experiences include fallbacks rather than making WebGL a requirement for using the application.

### Lazy Loading

The 3D experience is loaded after the initial page rendering so the main page does not depend on the 3D canvas being immediately available.

### Automated Testing

The project combines component tests with an end-to-end test so both isolated UI behavior and a primary user flow are covered.

---

# How AI Tools Were Used to Build BookVault

AI tools were used as development assistants throughout the project rather than as a replacement for testing or engineering decisions.

Specific uses included:

* Exploring implementation approaches for the Next.js App Router migration.
* Generating and refining component implementations.
* Assisting with the OpenRouter streaming integration.
* Designing the `searchBooks` tool and its validation flow.
* Helping structure streaming and error states.
* Assisting with the React Three Fiber implementation.
* Iterating on the custom shader hero.
* Generating test cases for component and AI-chat states.
* Reviewing accessibility and performance issues.
* Assisting with production-hardening ideas such as input limits and streaming duration.
* Reviewing README and project documentation.

The generated code was then run, tested, debugged, and adjusted locally.

For example, the AI implementation was not considered complete simply because code was generated. The `/ask-ai` flow was manually tested with recommendation and search prompts, the production deployment was tested, the test suite was run in CI, and the AI route was subsequently hardened with explicit input limits.

This workflow treated AI as a development collaborator while keeping verification and final engineering decisions in the development process.

---

# Browser and Production Verification

The production deployment was manually checked across the required browser/device environments.

The verification covered:

* Main navigation.
* Book browsing.
* Book details.
* AI streaming.
* AI book search.
* Recommendation cards.
* 3D viewer.
* Responsive layouts.
* Interactive controls.
* Error/fallback behavior.

The production AI flow was specifically verified with recommendation and search prompts, including generated `BookRecommendationCard` results.

---

# Deployment

BookVault is deployed on Vercel.

Production deployment:

```text
https://book-vault-ecru.vercel.app/
```

The application is built using the Next.js production build and uses Vercel environment configuration for the server-side OpenRouter API key.

---

# Deployment Safety and Rollback

BookVault is deployed through Vercel with the production environment configured separately from local development.

Before a production release:

1. Run the automated test suite.
2. Run the production build.
3. Verify the deployed application manually.
4. Confirm that the AI route and fallback states behave correctly.
5. Check the deployment after release.

If a deployment introduces a regression, the previous known-good Vercel deployment can be restored through the Vercel deployment history.

The application also includes fail-safe behavior for important failure cases:

- Missing AI configuration produces a user-visible configuration error instead of exposing credentials.
- Invalid AI requests are rejected server-side.
- Upstream AI failures produce an accessible error state.
- Tool failures produce an accessible search error state.
- Aborted AI requests are handled without exposing internal errors.
- WebGL-dependent experiences provide fallback behavior.
- Reduced-motion users receive a less animated experience.

The current application does not include external production monitoring or alerting. This is a known limitation and would be addressed in a future production iteration.

---

# Known Limitations

The current version intentionally does not include:

* User authentication.
* A persistent database.
* Cloud-saved favorites.
* Cloud-saved reading lists.
* A full external book database.
* A production-grade rate limiter.
* A detailed external 3D book model.

The AI search tool currently searches the local BookVault catalog rather than a large external book database.

---

# Future Improvements

Potential future work includes:

* Authentication and user accounts.
* Persistent favorites and reading lists.
* Database-backed book data.
* External book APIs.
* More advanced recommendation personalization.
* A production-grade rate-limiting layer.
* More detailed optimized 3D book assets.
* Broader physical-device performance testing.
* Expanded accessibility treatment for the 3D experience.
* More comprehensive end-to-end coverage.

---

# Status

BookVault is currently deployed as a working production capstone application.

The project includes:

* Production deployment
* AI streaming
* Generative book search
* Input validation and hardening
* Interactive 3D experience
* Custom shader hero
* Automated testing
* CI
* Accessibility improvements
* Performance optimization
* Responsive design
* Production verification

---

## License

No separate open-source license is currently specified for this project.
