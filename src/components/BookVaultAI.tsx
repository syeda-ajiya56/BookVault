'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import './BookVaultAI.css'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const initialMessage: Message = {
  role: 'assistant',
  content: 'Welcome to BookVault AI. Tell me what kind of story you are in the mood for.',
}

export default function BookVaultAI() {
  const [messages, setMessages] = useState<Message[]>([initialMessage])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasReceivedToken, setHasReceivedToken] = useState(false)
  const [error, setError] = useState('')
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

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const content = input.trim()
    if (!content || isStreaming) return

    const nextMessages = [...messages, { role: 'user' as const, content }, { role: 'assistant' as const, content: '' }]
    const conversationMessages = nextMessages.slice(1, -1)
    setMessages(nextMessages)
    setInput('')
    setError('')
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
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const token = decoder.decode(value, { stream: true })
        if (token) {
          setHasReceivedToken(true)
          setMessages((current) => {
            const updated = [...current]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + token,
            }
            return updated
          })
        }
      }
    } catch (streamError) {
      if (streamError instanceof DOMException && streamError.name === 'AbortError') return
      setError(streamError instanceof Error ? streamError.message : 'Something went wrong. Please try again.')
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
          {isStreaming && !hasReceivedToken && <p className="ai-chat__thinking" role="status">BookVault AI is thinking...</p>}
          <div ref={messagesEnd} />
        </div>

        {error && <p className="ai-chat__error" role="alert">{error}</p>}

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
