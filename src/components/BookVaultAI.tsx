'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import './BookVaultAI.css'
import BookRecommendationCard from './BookRecommendationCard'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type BookResult = {
  id: number
  title: string
  author: string
  coverImage: string
  description: string
  publicationYear: number
  genre: string
}

type ToolState =
  | {
      status: 'input-streaming'
      toolName: string
      arguments: string
    }
  | {
      status: 'input-available'
      toolName: string
      arguments: string
    }
  | {
      status: 'output-available'
      toolName: string
      result: {
        query: string
        books: BookResult[]
      }
    }
  | {
      status: 'output-error'
      toolName: string
      error: string
  }

const initialMessage: Message = {
  role: 'assistant',
  content: 'Welcome to BookVault AI. Tell me what kind of story you are in the mood for.',
}

export default function BookVaultAI() {
  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [toolState, setToolState] = useState<ToolState | null>(null)
  const [hasReceivedToken, setHasReceivedToken] = useState(false)
  const [error, setError] = useState('')
  const [lastFailedMessage, setLastFailedMessage] = useState('')
  const abortController = useRef<AbortController | null>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)
  const scrollContainer = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)

  useEffect(() => {
    if (shouldAutoScroll.current) {
      messagesEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  function handleScroll() {
    const container = scrollContainer.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    shouldAutoScroll.current = distanceFromBottom < 96
  }

  async function sendMessage(
  event?: FormEvent<HTMLFormElement>,
  retryContent?: string, ) {
  event?.preventDefault()
  const content = (retryContent ?? input).trim()
    if (!content || isStreaming) return

    const nextMessages = [...messages, { role: 'user' as const, content }, { role: 'assistant' as const, content: '' }]
    const conversationMessages = nextMessages.slice(1, -1)
    setMessages(nextMessages)
    setInput('')
    setError('')
    setLastFailedMessage('')
    setToolState(null)
    setIsStreaming(true)
    setHasReceivedToken(false)
    shouldAutoScroll.current = true

    const controller = new AbortController()
    abortController.current = controller

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMessages }),
        signal: controller.signal,
      })

      if (!response.ok || !response.body) {
        const payload: unknown = await response.json().catch(() => null)
        const serverError =
          payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'BookVault AI is temporarily unavailable. Please try again.'
        throw new Error(serverError)
      }

      const reader = response.body.getReader()
const decoder = new TextDecoder()

let buffer = ''

while (true) {
  const { done, value } = await reader.read()

  buffer += decoder.decode(value, { stream: !done })

  const events = buffer.split('\n\n')
  buffer = events.pop() ?? ''

  for (const event of events) {
    const lines = event.split('\n')

    let eventType = ''
    let eventData = ''

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim()
      }

      if (line.startsWith('data:')) {
        eventData = line.slice(5).trim()
      }
    }

    if (!eventData) continue

    try {
      const data: unknown = JSON.parse(eventData)

      if (eventType === 'text') {
        if (
          data &&
          typeof data === 'object' &&
          'content' in data &&
          typeof data.content === 'string'
        ) {
          setHasReceivedToken(true)

          setMessages((current) => {
            const updated = [...current]

            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content:
                updated[updated.length - 1].content + data.content,
            }

            return updated
          })
        }
      }

      if (eventType === 'tool-input-streaming') {
        if (
          data &&
          typeof data === 'object' &&
          'toolName' in data &&
          typeof data.toolName === 'string' &&
          'arguments' in data &&
          typeof data.arguments === 'string'
        ) {
          setToolState({
            status: 'input-streaming',
            toolName: data.toolName,
            arguments: data.arguments,
          })
        }
      }

      if (eventType === 'tool-input-available') {
        if (
          data &&
          typeof data === 'object' &&
          'toolName' in data &&
          typeof data.toolName === 'string' &&
          'arguments' in data &&
          typeof data.arguments === 'string'
        ) {
          setToolState({
            status: 'input-available',
            toolName: data.toolName,
            arguments: data.arguments,
          })
        }
      }

      if (eventType === 'tool-output-available') {
        if (
          data &&
          typeof data === 'object' &&
          'toolName' in data &&
          typeof data.toolName === 'string' &&
          'result' in data &&
          data.result &&
          typeof data.result === 'object'
        ) {
          const result = data.result as {
            query?: unknown
            books?: unknown
          }

          if (
            typeof result.query === 'string' &&
            Array.isArray(result.books)
          ) {
            setToolState({
              status: 'output-available',
              toolName: data.toolName,
              result: {
                query: result.query,
                books: result.books as BookResult[],
              },
            })
          }
        }
      }

      if (eventType === 'tool-output-error') {
        if (
          data &&
          typeof data === 'object' &&
          'toolName' in data &&
          typeof data.toolName === 'string' &&
          'error' in data &&
          typeof data.error === 'string'
        ) {
          setToolState({
            status: 'output-error',
            toolName: data.toolName,
            error: data.error,
          })
        }
      }

      if (eventType === 'error') {
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          typeof data.message === 'string'
        ) {
          throw new Error(data.message)
        }
      }
    } catch (eventError) {
      if (eventError instanceof Error) {
        throw eventError
      }

      // Ignore malformed SSE events.
    }
  }

  if (done) break
}
    } catch (streamError) {
      if (streamError instanceof DOMException && streamError.name === 'AbortError') return
      setError(streamError instanceof Error ? streamError.message : 'Something went wrong. Please try again.')
      setLastFailedMessage(content)
      setMessages((current) => {
        const lastMessage = current[current.length - 1]
        const previousMessage = current[current.length - 2]
        if (lastMessage?.role === 'assistant' && !lastMessage.content && previousMessage?.role === 'user') {
          return current.slice(0, -2)
        }
        return current
      })
    } finally {
      abortController.current = null
      setIsStreaming(false)
    }
  }

  function retryMessage() {
  if (!lastFailedMessage) return

  void sendMessage(undefined, lastFailedMessage)
}

  function stopGeneration() {
    abortController.current?.abort()
    abortController.current = null
    setIsStreaming(false)
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  return (
    <section className="ai-chat" aria-labelledby="ai-chat-title">
      <div className="ai-chat__intro">
        <p className="ai-chat__eyebrow">Your reading companion</p>
        <h1 id="ai-chat-title">Ask BookVault AI</h1>
        <p>Find your next story through a conversation about mood, genre, and the books you already love.</p>
      </div>

      <div className="ai-chat__panel">
        <div className="ai-chat__messages" ref={scrollContainer} onScroll={handleScroll} aria-live="polite" aria-label="Conversation">
          {messages.map((message, index) => (
            <article className={`ai-chat__message ai-chat__message--${message.role}`} key={`${message.role}-${index}`}>
              <p className="ai-chat__message-label">{message.role === 'assistant' ? 'BookVault AI' : 'You'}</p>
              <p className="ai-chat__message-content">
                {message.content || (isStreaming && index === messages.length - 1 ? <span className="ai-chat__cursor" aria-label="Generating" /> : null)}
              </p>
            </article>
          ))}
          {toolState?.status === 'input-streaming' && (
  <div className="ai-chat__tool-status" role="status">
    <span className="ai-chat__tool-dot" />
    Searching BookVault...
  </div>
)}

{toolState?.status === 'input-available' && (
  <div className="ai-chat__tool-status" role="status">
    <span className="ai-chat__tool-dot" />
    Searching for books...
  </div>
)}

{toolState?.status === 'output-available' && (
  <BookRecommendationCard
    query={toolState.result.query}
    books={toolState.result.books}
  />
)}

{toolState?.status === 'output-error' && (
  <div className="ai-chat__tool-error" role="alert">
    <strong>Book search failed</strong>
    <p>{toolState.error}</p>
  </div>
)}
          {isStreaming && !hasReceivedToken && <p className="ai-chat__thinking" role="status">BookVault AI is thinking...</p>}
          <div ref={messagesEnd} />
        </div>

{ 
error && (
  <div className="ai-chat__error" role="alert">
    <p>{error}</p>
    <button type="button" onClick={retryMessage}>
      Retry
    </button>
  </div>
)}
        <form className="ai-chat__form" onSubmit={sendMessage}>
          <label className="ai-chat__label" htmlFor="ai-chat-input">Ask a question</label>
          <textarea
            id="ai-chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="What should I read next?"
            rows={2}
            disabled={isStreaming}
          />
          <div className="ai-chat__actions">
            <span className="ai-chat__hint">Enter to send · Shift+Enter for a new line</span>
            {isStreaming ? (
              <button className="ai-chat__button ai-chat__button--stop" type="button" onClick={stopGeneration}>Stop</button>
            ) : (
              <button className="ai-chat__button" type="submit" disabled={!input.trim()}>Send</button>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}

