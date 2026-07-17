import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LMStudioClient, LMStudioError } from '@/ai/LMStudioClient'

const VALID_RESPONSE = JSON.stringify({
  choices: [
    { message: { content: '{"id":"r","label":"R","content":"Root"}' }, finish_reason: 'stop' },
  ],
})

function mockFetch(body: string, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(JSON.parse(body)),
    text: () => Promise.resolve(body),
  } as Response)
}

describe('LMStudioClient', () => {
  let client: LMStudioClient

  beforeEach(() => {
    client = new LMStudioClient({ baseUrl: 'http://localhost:1234/v1', model: 'test-model' })
  })

  it('returns assistant message content on success', async () => {
    globalThis.fetch = mockFetch(VALID_RESPONSE)
    const result = await client.complete([{ role: 'user', content: 'hello' }])
    expect(result).toBe('{"id":"r","label":"R","content":"Root"}')
  })

  it('sends correct POST body', async () => {
    globalThis.fetch = mockFetch(VALID_RESPONSE)
    await client.complete([{ role: 'user', content: 'test' }])
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(call[1].body as string)
    expect(body.model).toBe('test-model')
    expect(body.messages[0].content).toBe('test')
  })

  it('throws LMStudioError on HTTP 500', async () => {
    globalThis.fetch = mockFetch('Internal Server Error', 500)
    await expect(client.complete([])).rejects.toBeInstanceOf(LMStudioError)
  })

  it('throws LMStudioError when choices is missing', async () => {
    globalThis.fetch = mockFetch(JSON.stringify({ choices: [] }))
    await expect(client.complete([])).rejects.toBeInstanceOf(LMStudioError)
  })

  it('throws LMStudioError on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    await expect(client.complete([])).rejects.toBeInstanceOf(LMStudioError)
  })
})
