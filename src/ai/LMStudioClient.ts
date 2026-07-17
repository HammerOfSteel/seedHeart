import {
  LM_STUDIO_BASE_URL,
  LM_STUDIO_MODEL,
  LM_STUDIO_TEMPERATURE,
  LM_STUDIO_MAX_TOKENS,
} from '@/constants'

export class LMStudioError extends Error {
  readonly status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'LMStudioError'
    this.status = status
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface LMStudioResponse {
  choices: Array<{
    message: { content: string }
    finish_reason: string
  }>
}

/**
 * Thin client for the LM Studio OpenAI-compatible REST API.
 * Handles one chat completion at a time (no streaming).
 */
export class LMStudioClient {
  private baseUrl: string
  private model: string
  private temperature: number
  private maxTokens: number

  constructor(overrides?: {
    baseUrl?: string
    model?: string
    temperature?: number
    maxTokens?: number
  }) {
    this.baseUrl = overrides?.baseUrl ?? LM_STUDIO_BASE_URL
    this.model = overrides?.model ?? LM_STUDIO_MODEL
    this.temperature = overrides?.temperature ?? LM_STUDIO_TEMPERATURE
    this.maxTokens = overrides?.maxTokens ?? LM_STUDIO_MAX_TOKENS
  }

  /**
   * Send a chat completion request and return the assistant message content.
   * Throws `LMStudioError` on HTTP errors or malformed responses.
   */
  async complete(messages: ChatMessage[]): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`

    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        }),
      })
    } catch (err) {
      throw new LMStudioError(
        `Network error connecting to LM Studio at ${this.baseUrl}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new LMStudioError(
        `LM Studio returned ${response.status}: ${body.slice(0, 200)}`,
        response.status,
      )
    }

    let data: LMStudioResponse
    try {
      data = (await response.json()) as LMStudioResponse
    } catch {
      throw new LMStudioError('LM Studio response is not valid JSON')
    }

    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== 'string') {
      throw new LMStudioError('LM Studio response missing choices[0].message.content')
    }

    return content
  }
}
