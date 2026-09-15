'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('BookVault route error:', error)
  }, [error])

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <section
        className="w-full max-w-xl rounded-card border border-border bg-card p-8 text-center"
        role="alert"
      >
        <p className="mb-2 text-sm font-medium text-primary">
          Something went wrong
        </p>

        <h1 className="mb-4 text-2xl font-semibold text-foreground">
          BookVault could not load this page.
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">
          Please try again. If the problem continues, check your connection
          and reload the page.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="rounded-card bg-primary px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </section>
    </main>
  )
}