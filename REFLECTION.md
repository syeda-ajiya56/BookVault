# Capstone Reflection

## Project Overview

I built BookVault as a digital library experience for readers who want to discover books, view details, manage reading-related experiences, and ask for recommendations. The project includes a streaming AI reading assistant, catalog search through an AI tool, an interactive 3D book viewer, and a custom WebGL shader hero. BookVault is deployed to production at https://book-vault-ecru.vercel.app/.

## What I Learned

I learned how to structure an application with the Next.js App Router, including server-rendered pages and focused client components for interactive features. I implemented a server-side AI integration with streaming responses and learned how to keep provider credentials out of the browser. I also learned how AI tool calls can support generative catalog search, with Zod validating the search input.

The 3D route gave me practical experience with React Three Fiber, Three.js geometry, controls, materials, lighting, and responsive interaction. I also implemented a custom WebGL fragment shader using time, resolution, and mouse uniforms, along with device-pixel-ratio limits, hidden-tab pausing, and reduced-motion behavior. Testing with Vitest, React Testing Library, and Playwright, together with CI, helped me verify behavior beyond manual development checks. Accessibility and performance work included contrast improvements, keyboard testing, lazy loading, fallback states, and measured Lighthouse and WAVE audits. I also learned the value of production hardening through input limits, error handling, request cancellation, and graceful WebGL failure handling.

## Biggest Technical Challenges

The most challenging part was coordinating streamed AI responses with tool-call events, partial text, retries, cancellation, and recommendation results. The server route and client chat needed to handle normal responses, search requests, streaming errors, and stopped generations without losing already received text.

I also found that production behavior requires more than the successful path. Input length and message-count limits, provider failures, malformed tool data, WebGL initialization failures, loading states, reduced motion, hidden tabs, and mobile rendering all needed deliberate handling. The 3D and shader work was especially sensitive to browser capabilities, drawing-buffer size, animation lifecycle, and accessibility preferences.

## Use of AI Tools

I used AI tools as development assistants for implementation ideas, code generation and refinement, debugging, testing ideas, accessibility review, and documentation. I manually inspected the generated code, tested behavior, debugged failures, reviewed accessibility findings, and verified the production build. AI did not independently build or verify the project.

## Testing and Quality

The project has 12 passing automated tests and recorded statement coverage of 76.03%. The documented Lighthouse mobile results reached 92 Performance and 100 Accessibility. WAVE reported 0 accessibility errors and 0 contrast errors across the six documented pages. Keyboard testing also covered navigation, chat input, sending, streaming, and stopping generation.

## Future Improvements

I would add authentication, database-backed favorites and reading lists, and external book APIs. I would also add production-grade rate limiting and monitoring, more comprehensive end-to-end testing, more optimized and detailed 3D assets, and broader testing on physical devices.
