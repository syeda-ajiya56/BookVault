import { AI_MAX_TOKENS, AI_MODEL, AI_SYSTEM_PROMPT } from '@/lib/ai'
import {
  searchBooksInputSchema,
  searchBooksTool,
} from '@/lib/searchBooks'

export const maxDuration = 60

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 2000
const MAX_TOTAL_INPUT_LENGTH = 10000

type ToolCall = {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false

  const message = value as Record<string, unknown>

  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  )
}

function createSseStream() {
  const encoder = new TextEncoder()

  return {
    encoder,

    send(
      controller: ReadableStreamDefaultController<Uint8Array>,
      event: string,
      data: unknown,
    ) {
      controller.enqueue(
        encoder.encode(
          `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
        ),
      )
    },
  }
}

export async function POST(request: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return Response.json(
      { error: 'BookVault AI is not configured yet.' },
      { status: 503 },
    )
  }

  try {
    const body: unknown = await request.json()

    const messages: unknown[] =
      body &&
      typeof body === 'object' &&
      Array.isArray((body as { messages?: unknown }).messages)
        ? (body as { messages: unknown[] }).messages
        : []

    if (messages.length === 0 || messages.length > MAX_MESSAGES) {
      return Response.json(
        { error: 'Please send a valid conversation.' },
        { status: 400 },
      )
    }

    if (!messages.every(isChatMessage)) {
      return Response.json(
        { error: 'Please send a valid conversation.' },
        { status: 400 },
      )
    }

    const validMessages = messages as ChatMessage[]

    const totalInputLength = validMessages.reduce(
      (total, message) => total + message.content.length,
      0,
    )

    if (totalInputLength > MAX_TOTAL_INPUT_LENGTH) {
      return Response.json(
        {
          error:
            'Your conversation is too long. Please start a new conversation.',
        },
        { status: 400 },
      )
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const { send } = createSseStream()

        try {
          const firstResponse = await fetch(OPENROUTER_ENDPOINT, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: AI_MODEL,
              max_tokens: AI_MAX_TOKENS,
              messages: [
                {
                  role: 'system',
                  content: AI_SYSTEM_PROMPT,
                },
                ...validMessages,
              ],
              tools: [
                {
                  type: 'function',
                  function: {
                    name: searchBooksTool.name,
                    description: searchBooksTool.description,
                    parameters: {
                      type: 'object',
                      properties: {
                        query: {
                          type: 'string',
                          description:
                            'The mood, genre, author, title, or topic the reader is looking for.',
                        },
                      },
                      required: ['query'],
                      additionalProperties: false,
                    },
                  },
                },
              ],
              tool_choice: 'auto',
              stream: true,
            }),
            signal: request.signal,
          })

          if (!firstResponse.ok || !firstResponse.body) {
            const status = firstResponse.status === 429 ? 429 : 502

            send(controller, 'error', {
              message:
                'BookVault AI is temporarily unavailable. Please try again.',
            })

            controller.close()
            return
          }

          const reader = firstResponse.body.getReader()
          const decoder = new TextDecoder()

          let buffer = ''
          let assistantText = ''
          const toolCalls = new Map<number, ToolCall>()

          while (true) {
            const { done, value } = await reader.read()

            buffer += decoder.decode(value, { stream: !done })

            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              if (!line.startsWith('data:')) continue

              const data = line.slice(5).trim()

              if (!data || data === '[DONE]') continue

              try {
                const parsed: unknown = JSON.parse(data)

                if (
                  !parsed ||
                  typeof parsed !== 'object' ||
                  !('choices' in parsed) ||
                  !Array.isArray(parsed.choices)
                ) {
                  continue
                }

                const choice = parsed.choices[0]

                if (!choice || typeof choice !== 'object') continue

                const delta =
                  'delta' in choice &&
                  choice.delta &&
                  typeof choice.delta === 'object'
                    ? choice.delta
                    : null

                if (!delta) continue

                if (
                  'content' in delta &&
                  typeof delta.content === 'string' &&
                  delta.content
                ) {
                  assistantText += delta.content

                  send(controller, 'text', {
                    content: delta.content,
                  })
                }

                if (
                  'tool_calls' in delta &&
                  Array.isArray(delta.tool_calls)
                ) {
                  for (const partialCall of delta.tool_calls) {
                    if (!partialCall || typeof partialCall !== 'object') {
                      continue
                    }

                    const index =
                      'index' in partialCall &&
                      typeof partialCall.index === 'number'
                        ? partialCall.index
                        : 0

                    const existing = toolCalls.get(index)

                    const id =
                      'id' in partialCall &&
                      typeof partialCall.id === 'string'
                        ? partialCall.id
                        : existing?.id ?? `tool-call-${index}`

                    const functionData =
                      'function' in partialCall &&
                      partialCall.function &&
                      typeof partialCall.function === 'object'
                        ? partialCall.function
                        : null

                    const name =
                      functionData &&
                      'name' in functionData &&
                      typeof functionData.name === 'string'
                        ? functionData.name
                        : existing?.function.name ?? ''

                    const argumentsChunk =
                      functionData &&
                      'arguments' in functionData &&
                      typeof functionData.arguments === 'string'
                        ? functionData.arguments
                        : ''

                    const updatedCall: ToolCall = {
                      id,
                      type: 'function',
                      function: {
                        name,
                        arguments:
                          (existing?.function.arguments ?? '') +
                          argumentsChunk,
                      },
                    }

                    toolCalls.set(index, updatedCall)

                    send(controller, 'tool-input-streaming', {
                      toolName: name || 'searchBooks',
                      arguments: updatedCall.function.arguments,
                    })
                  }
                }
              } catch {
                // Ignore incomplete SSE JSON chunks.
              }
            }

            if (done) break
          }

          if (toolCalls.size === 0) {
            send(controller, 'done', {})
            controller.close()
            return
          }

          const completedToolCalls = Array.from(toolCalls.values())

          for (const toolCall of completedToolCalls) {
            if (toolCall.function.name !== searchBooksTool.name) {
              send(controller, 'tool-output-error', {
                toolName: toolCall.function.name,
                error: 'Unknown tool requested.',
              })

              continue
            }

            send(controller, 'tool-input-available', {
              toolName: searchBooksTool.name,
              arguments: toolCall.function.arguments,
            })

            try {
              const rawArguments: unknown = JSON.parse(
                toolCall.function.arguments,
              )

              const parsedArguments =
                searchBooksInputSchema.safeParse(rawArguments)

              if (!parsedArguments.success) {
                throw new Error('Invalid searchBooks input.')
              }

              const result =
                await searchBooksTool.execute(parsedArguments.data)

              send(controller, 'tool-output-available', {
                toolName: searchBooksTool.name,
                result,
              })

              const followUpMessages = [
                {
                  role: 'system' as const,
                  content: AI_SYSTEM_PROMPT,
                },
                ...validMessages,
                {
                  role: 'assistant' as const,
                  content: assistantText || null,
                  tool_calls: completedToolCalls,
                },
                {
                  role: 'tool' as const,
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(result),
                },
              ]

              const secondResponse = await fetch(
                OPENROUTER_ENDPOINT,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: AI_MODEL,
                    max_tokens: AI_MAX_TOKENS,
                    messages: followUpMessages,
                    stream: true,
                  }),
                  signal: request.signal,
                },
              )

              if (!secondResponse.ok || !secondResponse.body) {
                throw new Error(
                  'BookVault AI could not complete the response.',
                )
              }

              const secondReader = secondResponse.body.getReader()
              const secondDecoder = new TextDecoder()
              let secondBuffer = ''

              while (true) {
                const {
                  done: secondDone,
                  value: secondValue,
                } = await secondReader.read()

                secondBuffer += secondDecoder.decode(secondValue, {
                  stream: !secondDone,
                })

                const secondLines = secondBuffer.split('\n')
                secondBuffer = secondLines.pop() ?? ''

                for (const line of secondLines) {
                  if (!line.startsWith('data:')) continue

                  const data = line.slice(5).trim()

                  if (!data || data === '[DONE]') continue

                  try {
                    const parsed: unknown = JSON.parse(data)

                    if (
                      !parsed ||
                      typeof parsed !== 'object' ||
                      !('choices' in parsed) ||
                      !Array.isArray(parsed.choices)
                    ) {
                      continue
                    }

                    const choice = parsed.choices[0]

                    if (!choice || typeof choice !== 'object') continue

                    const delta =
                      'delta' in choice &&
                      choice.delta &&
                      typeof choice.delta === 'object'
                        ? choice.delta
                        : null

                    if (
                      delta &&
                      'content' in delta &&
                      typeof delta.content === 'string' &&
                      delta.content
                    ) {
                      send(controller, 'text', {
                        content: delta.content,
                      })
                    }
                  } catch {
                    // Ignore incomplete SSE JSON chunks.
                  }
                }

                if (secondDone) break
              }
            } catch (toolError) {
              send(controller, 'tool-output-error', {
                toolName: searchBooksTool.name,
                error:
                  toolError instanceof Error
                    ? toolError.message
                    : 'The book search failed.',
              })
            }
          }

          send(controller, 'done', {})
          controller.close()
        } catch (error) {
          if (request.signal.aborted) {
            controller.close()
            return
          }

          send(controller, 'error', {
            message:
              error instanceof Error
                ? error.message
                : 'BookVault AI is temporarily unavailable. Please try again.',
          })

          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream; charset=utf-8',
        Connection: 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 })
    }

    return Response.json(
      {
        error:
          'BookVault AI is temporarily unavailable. Please try again.',
      },
      { status: 502 },
    )
  }
}