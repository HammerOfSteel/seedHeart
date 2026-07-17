import { describe, it, expect } from 'vitest'
import { extractJSON } from '@/ai/generateMemeTree'

describe('extractJSON', () => {
  it('returns plain JSON unchanged', () => {
    const json = '{"id":"r","label":"Root","content":"x"}'
    expect(extractJSON(json)).toBe(json)
  })

  it('strips json markdown fence', () => {
    const wrapped = '```json\n{"id":"r","label":"Root","content":"x"}\n```'
    expect(extractJSON(wrapped)).toBe('{"id":"r","label":"Root","content":"x"}')
  })

  it('strips plain markdown fence', () => {
    const wrapped = '```\n{"id":"r","label":"Root","content":"x"}\n```'
    expect(extractJSON(wrapped)).toBe('{"id":"r","label":"Root","content":"x"}')
  })

  it('extracts JSON when surrounded by text', () => {
    const text = 'Here is the tree:\n{"id":"r","label":"Root","content":"x"}\nDone.'
    const result = extractJSON(text)
    expect(result).toContain('"id":"r"')
  })
})
