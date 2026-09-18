'use client'

import { useEffect, useState } from 'react'
import StatefulButton from '@/components/StatefulButton'
import type { StatefulButtonState } from '@/components/StatefulButton'

export default function ButtonDemoPage() {
  const [state, setState] = useState<StatefulButtonState>('idle')

  useEffect(() => {
    if (state !== 'loading' && state !== 'success') return

    const timer = window.setTimeout(() => setState(state === 'loading' ? 'success' : 'idle'), 900)
    return () => window.clearTimeout(timer)
  }, [state])

  function handleClick() {
    setState('loading')
  }

  return (
    <section aria-labelledby="button-demo-title" className="mx-auto max-w-2xl space-y-8 py-12">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">UI assignment</p>
        <h1 id="button-demo-title" className="text-4xl tracking-tight text-primary sm:text-5xl">
          Stateful Button
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted">
          An isolated playground for a button that moves through its interaction states.
        </p>
      </div>

      <div className="space-y-5 rounded-card border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">Current state</span>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {state}
          </span>
        </div>

        <StatefulButton state={state} onClick={handleClick} className="w-full sm:w-auto">
          {state === 'idle' ? 'Send message →' : state === 'error' ? 'Retry action' : 'Run action'}
        </StatefulButton>

        <div className="flex flex-wrap gap-2" aria-label="Preview button states">
          {(['idle', 'error', 'disabled'] as const).map((previewState) => (
            <button
              key={previewState}
              type="button"
              className="rounded border border-border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:border-primary hover:text-primary"
              onClick={() => setState(previewState)}
            >
              Preview {previewState}
            </button>
          ))}
        </div>
      </div>

      <aside aria-labelledby="motion-notes-title" className="space-y-2 border-l-2 border-accent/50 pl-5">
        <h2 id="motion-notes-title" className="text-lg text-primary">
          Motion notes
        </h2>
        <p className="text-sm leading-7 text-muted">
          Hover and press interactions use short, approximately 200ms ease-out transitions so the button feels responsive. Loading and success or error state transitions use approximately 250ms timing, making changes noticeable without feeling slow. The error shake lasts approximately 350ms and runs only once. Transform and opacity are preferred for animation because they are compositor-friendly and avoid layout thrashing. When reduced motion is requested, movement is reduced or removed while state feedback remains visible.
        </p>
      </aside>
    </section>
  )
}