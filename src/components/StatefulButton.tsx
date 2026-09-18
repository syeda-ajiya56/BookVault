'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type StatefulButtonState = 'idle' | 'loading' | 'success' | 'error' | 'disabled'

type StatefulButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  state: StatefulButtonState
  children: ReactNode
}

const stateLabels: Record<StatefulButtonState, string> = {
  idle: 'Ready',
  loading: 'Sending...',
  success: 'Sent!',
  error: 'Try again',
  disabled: 'Disabled',
}

export default function StatefulButton({ state, children, disabled, ...props }: StatefulButtonProps) {
  const isUnavailable = disabled || state === 'loading' || state === 'success' || state === 'disabled'
  const isLoading = state === 'loading'
  const isSuccess = state === 'success'
  const isError = state === 'error'
  const isDisabledState = state === 'disabled'
  const isTransitioning = isLoading || isSuccess || isError || isDisabledState

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      disabled={isUnavailable}
      aria-busy={isLoading}
      aria-label={isLoading ? 'Sending...' : isSuccess ? 'Sent!' : isError ? 'Retry' : props['aria-label']}
      data-state={state}
      className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-card bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-[transform,background-color,opacity] duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none motion-reduce:transition-none motion-reduce:transform-none ${isError ? 'animate-[stateful-button-shake_350ms_ease-out_1] motion-reduce:animate-none' : ''} ${props.className ?? ''}`}
    >
      <span className="relative inline-grid">
        <span
          className={`col-start-1 row-start-1 transition-[opacity,transform] duration-[250ms] ease-in-out motion-reduce:transition-none motion-reduce:transform-none ${isTransitioning ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'}`}
        >
          {children}
        </span>
        <span
          aria-live="polite"
          aria-hidden={!isDisabledState}
          className={`col-start-1 row-start-1 inline-flex items-center text-xs uppercase tracking-[0.14em] transition-[opacity,transform] duration-[250ms] ease-in-out motion-reduce:transition-none motion-reduce:transform-none ${isDisabledState ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'}`}
        >
          {stateLabels[state]}
        </span>
        <span
          aria-hidden={!isLoading}
          className={`col-start-1 row-start-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] transition-[opacity,transform] duration-[250ms] ease-in-out motion-reduce:transition-none motion-reduce:transform-none ${isLoading ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
        >
          {isLoading && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground motion-reduce:animate-none"
            />
          )}
          {stateLabels.loading}
        </span>
        <span
          aria-live="polite"
          aria-hidden={!isSuccess}
          className={`col-start-1 row-start-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] transition-[opacity,transform] duration-[250ms] ease-out motion-reduce:transition-none motion-reduce:transform-none ${isSuccess ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-95 opacity-0'}`}
        >
          <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20" fill="none">
            <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {stateLabels.success}
        </span>
        <span
          aria-live="polite"
          aria-hidden={!isError}
          className={`col-start-1 row-start-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-[opacity,transform] duration-[250ms] ease-out motion-reduce:transition-none motion-reduce:transform-none ${isError ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
        >
          <svg aria-hidden="true" className="size-4" viewBox="0 0 20 20" fill="none">
            <path d="M16 8a6 6 0 1 0 1 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M16 4v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {stateLabels.error}
        </span>
      </span>
    </button>
  )
}