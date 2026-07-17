import type { RawMemeNode } from './TreeBuilder'

export class TreeParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TreeParseError'
  }
}

/**
 * Parses and validates the JSON string returned by the LM Studio AI model.
 *
 * Expected shape:
 * ```json
 * {
 *   "id": "root",
 *   "label": "Concept",
 *   "content": "Root description",
 *   "children": [ ... ]
 * }
 * ```
 *
 * Throws `TreeParseError` on any structural violation.
 */
export function parseAIResponse(jsonString: string): RawMemeNode {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new TreeParseError(`Invalid JSON: ${jsonString.slice(0, 80)}`)
  }

  return validateNode(parsed, 'root')
}

function validateNode(value: unknown, path: string): RawMemeNode {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TreeParseError(`Expected object at ${path}, got ${typeof value}`)
  }

  const obj = value as Record<string, unknown>

  const id = requireString(obj, 'id', path)
  const label = requireString(obj, 'label', path)
  const content = requireString(obj, 'content', path)

  const rawChildren = obj['children']
  const children: RawMemeNode[] = []

  if (rawChildren !== undefined) {
    if (!Array.isArray(rawChildren)) {
      throw new TreeParseError(`Expected array for ${path}.children`)
    }
    for (let i = 0; i < rawChildren.length; i++) {
      children.push(validateNode(rawChildren[i], `${path}.children[${i}]`))
    }
  }

  return { id, label, content, children }
}

function requireString(obj: Record<string, unknown>, key: string, path: string): string {
  const val = obj[key]
  if (typeof val !== 'string' || val.trim() === '') {
    throw new TreeParseError(`Expected non-empty string for ${path}.${key}`)
  }
  return val
}
