import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BookVaultAI from '@/components/BookVaultAI'

function sseEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function completedSseResponse(events: string[] = []) {
  const encoder = new TextEncoder()

  return new Response(
    new ReadableStream({
      start(controller) {
        for (const event of events) {
          controller.enqueue(encoder.encode(event))
        }
        controller.close()
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } },
  )
}

function renderChat() {
  return render(<BookVaultAI />)
}

describe('BookVaultAI', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the welcome message, question field, and Send button initially', () => {
    renderChat()

    expect(
      screen.getByText(
        'Welcome to BookVault AI. Tell me what kind of story you are in the mood for.',
      ),
    ).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Ask a question' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Send' })).toBeVisible()
  })

  it('does not request the API for empty or whitespace-only input', async () => {
    const user = userEvent.setup()
    renderChat()
    const input = screen.getByRole('textbox', { name: 'Ask a question' })
    const send = screen.getByRole('button', { name: 'Send' })

    expect(send).toBeDisabled()
    await user.type(input, '   ')
    expect(send).toBeDisabled()
    await user.click(send)

    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows the pending state and streaming controls while waiting for the first token', async () => {
    const user = userEvent.setup()
    let resolveResponse!: (response: Response) => void
    vi.mocked(fetch).mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve
      }),
    )
    renderChat()

    const input = screen.getByRole('textbox', { name: 'Ask a question' })
    await user.type(input, 'Find a quiet mystery')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Find a quiet mystery')).toBeVisible()
    expect(await screen.findByText('BookVault AI is thinking...')).toBeVisible()
    expect(input).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Stop' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument()

    resolveResponse(completedSseResponse())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled())
  })

  it('renders controlled streamed text and the Generating indicator before the first token', async () => {
    const user = userEvent.setup()
    const encoder = new TextEncoder()
    let controller!: ReadableStreamDefaultController<Uint8Array>
    const response = new Response(
      new ReadableStream({
        start(streamController) {
          controller = streamController
        },
      }),
      { headers: { 'Content-Type': 'text/event-stream' } },
    )
    vi.mocked(fetch).mockResolvedValue(response)
    renderChat()

    await user.type(
      screen.getByRole('textbox', { name: 'Ask a question' }),
      'Recommend a fantasy book',
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByLabelText('Generating')).toBeVisible()
    controller.enqueue(encoder.encode(sseEvent('text', { content: 'Try The Night Circus.' })))
    expect(await screen.findByText('Try The Night Circus.')).toBeVisible()

    controller.enqueue(encoder.encode(sseEvent('done', {})))
    controller.close()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled())
  })

  it('renders a generic API error with an accessible Retry button', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockRejectedValue(new Error('The reading service is unavailable.'))
    renderChat()

    await user.type(
      screen.getByRole('textbox', { name: 'Ask a question' }),
      'Suggest a book',
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('The reading service is unavailable.')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
  })

  it('retries a failed request and renders the successful assistant response', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('Temporary failure.'))
      .mockResolvedValueOnce(
        completedSseResponse([
          sseEvent('text', { content: 'Here is a thoughtful recommendation.' }),
        ]),
      )
    renderChat()

    await user.type(
      screen.getByRole('textbox', { name: 'Ask a question' }),
      'Suggest a thoughtful book',
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await screen.findByRole('button', { name: 'Retry' })
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByText('Here is a thoughtful recommendation.')).toBeVisible()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('renders the user-visible tool search status from an input-streaming event', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValue(
      completedSseResponse([
        sseEvent('tool-input-streaming', {
          toolName: 'searchBooks',
          arguments: '{"query":"cozy fantasy"}',
        }),
      ]),
    )
    renderChat()

    await user.type(
      screen.getByRole('textbox', { name: 'Ask a question' }),
      'Find a cozy fantasy',
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(await screen.findByText('Searching BookVault...')).toBeVisible()
  })

  it('renders an accessible alert for a failed book search tool result', async () => {
    const user = userEvent.setup()
    vi.mocked(fetch).mockResolvedValue(
      completedSseResponse([
        sseEvent('tool-output-error', {
          toolName: 'searchBooks',
          error: 'The book search failed.',
        }),
      ]),
    )
    renderChat()

    await user.type(
      screen.getByRole('textbox', { name: 'Ask a question' }),
      'Search for a book',
    )
    await user.click(screen.getByRole('button', { name: 'Send' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Book search failed')
    expect(alert).toHaveTextContent('The book search failed.')
  })
})
