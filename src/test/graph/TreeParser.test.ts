import { describe, it, expect } from 'vitest'
import { parseAIResponse, TreeParseError } from '@/graph/TreeParser'

const VALID_JSON = JSON.stringify({
  id: 'root',
  label: 'Root',
  content: 'Root content',
  children: [{ id: 'child-1', label: 'Child 1', content: 'Content 1', children: [] }],
})

describe('parseAIResponse', () => {
  it('parses a valid JSON string into a RawMemeNode', () => {
    const result = parseAIResponse(VALID_JSON)
    expect(result.id).toBe('root')
    expect(result.label).toBe('Root')
    expect(result.children).toHaveLength(1)
  })

  it('throws TreeParseError on invalid JSON', () => {
    expect(() => parseAIResponse('{ not json')).toThrowError(TreeParseError)
  })

  it('throws TreeParseError when root is not an object', () => {
    expect(() => parseAIResponse('"just a string"')).toThrowError(TreeParseError)
  })

  it('throws TreeParseError when id is missing', () => {
    const bad = JSON.stringify({ label: 'X', content: 'y' })
    expect(() => parseAIResponse(bad)).toThrowError(TreeParseError)
  })

  it('throws TreeParseError when label is empty string', () => {
    const bad = JSON.stringify({ id: 'x', label: '', content: 'y' })
    expect(() => parseAIResponse(bad)).toThrowError(TreeParseError)
  })

  it('throws TreeParseError when children is not an array', () => {
    const bad = JSON.stringify({ id: 'x', label: 'x', content: 'x', children: 'oops' })
    expect(() => parseAIResponse(bad)).toThrowError(TreeParseError)
  })

  it('handles missing children field (treats as no children)', () => {
    const noChildren = JSON.stringify({ id: 'x', label: 'x', content: 'x' })
    const result = parseAIResponse(noChildren)
    expect(result.children).toHaveLength(0)
  })

  it('recursively validates nested children', () => {
    const nested = JSON.stringify({
      id: 'root',
      label: 'Root',
      content: 'Root',
      children: [
        { id: 'c', label: 'C', content: 'C', children: [{ id: 'g', label: 'G', content: 'G' }] },
      ],
    })
    const result = parseAIResponse(nested)
    expect(result.children![0].children![0].id).toBe('g')
  })

  it('throws when a nested child is invalid', () => {
    const bad = JSON.stringify({
      id: 'root',
      label: 'Root',
      content: 'Root',
      children: [{ label: 'No ID', content: 'x' }],
    })
    expect(() => parseAIResponse(bad)).toThrowError(TreeParseError)
  })
})
