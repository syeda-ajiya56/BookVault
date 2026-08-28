import { AI_MAX_TOKENS, AI_MODEL, AI_SYSTEM_PROMPT } from '@/lib/ai'

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false

  const message = value as Record<string, unknown>
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0
  )
}

export async function POST(request: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json({ error: 'BookVault AI is not configured yet.' }, { status: 503 })
  }

  try {
    const body: unknown = await request.json()
    const messages =
      body && typeof body === 'object' && Array.isArray((body as { messages?: unknown }).messages)
        ? (body as { messages: unknown[] }).messages
        : null

    if (!messages || messages.length === 0 || messages.length > 20 || !messages.every(isChatMessage)) {
      return Response.json({ error: 'Please send a valid conversation.' }, { status: 400 })
    }

    const upstreamResponse = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        messages: [{ role: 'system', content: AI_SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
      signal: request.signal,
    })

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return Response.json(
        { error: 'BookVault AI is temporarily unavailable. Please try again.' },
        { status: upstreamResponse.status === 429 ? 429 : 502 },
      )
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const textStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstreamResponse.body!.getReader()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            buffer += decoder.decode(value, { stream: !done })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              if (!line.startsWith('data:')) continue

              const data = line.slice(5).trim()
              if (data === '[DONE]') continue

              try {
                const parsed: unknown = JSON.parse(data)
                const content =
                  parsed && typeof parsed === 'object' && 'choices' in parsed && Array.isArray(parsed.choices)
                    ? parsed.choices[0]?.delta?.content
                    : null
                if (typeof content === 'string' && content) {
                  controller.enqueue(encoder.encode(content))
                }
              } catch {
                // Ignore incomplete or non-JSON SSE lines.
              }
            }

            if (done) break
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(textStream, {
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 })
    }

    return Response.json({ error: 'BookVault AI is temporarily unavailable. Please try again.' }, { status: 502 })
  }
}
