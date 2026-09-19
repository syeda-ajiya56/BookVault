# BookVault

BookVault is a modern digital library foundation for discovering and keeping track of books. This FE-05 skeleton establishes the Next.js application structure for future capstone work.

## Stack

- Next.js with the App Router
- TypeScript
- Tailwind CSS
- Server Components by default
- Local mock book data

No authentication, database, or Firebase integration is implemented. BookVault does include a server-side AI API route for the streaming chat and book search tool.

## Routes

| Route | Purpose |
|---|---|
| `/` | BookVault home and featured collection |
| `/books` | Book collection |
| `/books/[id]` | Book details for a mock book |
| `/favorites` | Favorites placeholder |
| `/reading-list` | Reading list placeholder |
| `/about` | About BookVault |
| `/3d` | Interactive 3D book viewer |
| `/health` | Health-check placeholder |

## Interactive 3D Experience

### What I Built

The `/3d` route provides an interactive BookVault book viewer built with React Three Fiber and Three.js. Users can:

- Orbit and zoom the book with touch or pointer controls.
- Change the cover color between Burgundy, Navy, and Forest.
- Switch between Matte and Glossy materials.
- Open and close the book.
- Enable or disable automatic rotation.

### Performance / FE-10

The production FE-10 check confirmed:

- The production build passed.
- Initial server-rendered HTML contains the page heading but no canvas.
- The 3D viewer is dynamically and lazily loaded after the initial page render.
- At a 1280px desktop viewport, the canvas measured approximately 1199 x 619 CSS pixels with approximately 1x backing resolution.
- At a 375px mobile viewport, the canvas measured approximately 319 x 359 CSS pixels with approximately 1x backing resolution.
- Frame sampling measured approximately 61 FPS during mobile interaction, auto-rotate, and desktop rendering.
- No obvious rendering stalls or frame drops were observed.
- The scene uses lightweight procedural geometry rather than a heavy external 3D model.
- A loading placeholder prevents dramatic layout shift before the viewer initializes.

The production check produced warnings but no console errors.

### Responsible Shipping

- A static HTML/CSS fallback appears when WebGL is unavailable or Save-Data is enabled.
- Reduced-motion mode disables automatic rotation and continuous animation while keeping basic book interaction usable.
- The viewer, controls, loading state, and fallback are responsive for mobile and touch-sized viewports.

### What I Would Add With More Time

- A more detailed, optimized GLB book model.
- Further GPU and mobile profiling across a range of physical devices.
- More detailed accessibility treatment around the 3D scene.
- Additional book customization options.

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

## AI Tool: searchBooks

BookVault AI uses a server-side `searchBooks` tool to find relevant books from the BookVault catalog based on a user's mood, genre, author, title, or topic.

### Tool Name

`searchBooks`

### Input Schema

The tool accepts one required field:

```ts
{
  query: string
}
```

The `query` must contain between 1 and 100 characters.

### Return Shape

The tool returns:

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

### Execution

The tool is executed server-side in:

`src/lib/searchBooks.ts`

The AI can request the tool when a user asks for book recommendations or searches by mood, genre, author, title, or topic. The tool validates its input with Zod, searches the BookVault book data, and returns up to three matching books.

### Tool Lifecycle States

- `input-streaming` — tool arguments are being streamed.
- `input-available` — the complete tool input is available.
- `output-available` — the tool successfully returned book results.
- `output-error` — the tool execution failed and an error state is shown.