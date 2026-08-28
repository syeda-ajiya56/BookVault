# BookVault

BookVault is a modern digital library foundation for discovering and keeping track of books. This FE-05 skeleton establishes the Next.js application structure for future capstone work.

## Stack

- Next.js with the App Router
- TypeScript
- Tailwind CSS
- Server Components by default
- Local mock book data

No API, authentication, database, Firebase integration, or health-check fetch is implemented yet.

## Routes

| Route | Purpose |
|---|---|
| `/` | BookVault home and featured collection |
| `/books` | Book collection |
| `/books/[id]` | Book details for a mock book |
| `/favorites` | Favorites placeholder |
| `/reading-list` | Reading list placeholder |
| `/about` | About BookVault |
| `/health` | Health-check placeholder |

## Project Structure

```text
src/
├── app/                 # Next.js App Router pages and root layout
├── components/          # Preserved reusable component work
├── data/books.ts        # Shared six-book mock data
├── hooks/               # Preserved client-side feature work
└── legacy-pages/        # Preserved React Router pages from the Vite version
```

The legacy folders are retained for reference and future migration work. The active application is the `src/app` App Router tree.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

Check the project:

```bash
npm run lint
npm run build
```

## FE-05 Capstone
BookVault capstone skeleton deployed with Next.js and Vercel.

## AI Streaming Chat

BookVault includes an OpenRouter-powered streaming reading assistant at `/ask-ai`. OpenRouter's free model router selects an available free model, responses stream progressively, generation can be stopped while preserving the text already received, and the conversation supports multiple turns.

The OpenRouter API key is server-side only. Configure `OPENROUTER_API_KEY` in the root `.env.local` for local development or in the Vercel project environment variables for deployment. Never prefix it with `VITE_` or `NEXT_PUBLIC_`, or expose it in client code.

Relevant files:

- `src/lib/ai.ts` - OpenRouter model configuration and BookVault AI system prompt
- `src/app/api/chat/route.ts` - server-side OpenRouter streaming route
- `src/components/BookVaultAI.tsx` - accessible chat UI and streaming state
- `src/components/BookVaultAI.css` - responsive chat styling