import type { LMStudioClient } from './LMStudioClient'
import { parseAIResponse } from '@/graph/TreeParser'
import { buildTree } from '@/graph/TreeBuilder'
import { layoutTree } from '@/graph/TreeLayout'
import type { MemeTree } from '@/graph/types'
import { MAX_TREE_DEPTH, MAX_TREE_BREADTH } from '@/constants'

const SYSTEM_PROMPT = `You are a meme-tree generator. A "meme" is the smallest meaningful unit of an idea (in Terence McKenna's sense).

Given a seed concept, decompose it recursively into its constituent memes and return ONLY a valid JSON object (no markdown, no explanation).

JSON shape:
{
  "id": "kebab-case-id",
  "label": "Short label (2-5 words)",
  "content": "One sentence description.",
  "children": [ ...same shape recursively... ]
}

Rules:
- Maximum depth: ${MAX_TREE_DEPTH}
- Maximum children per node: ${MAX_TREE_BREADTH}
- IDs must be unique kebab-case strings
- Return ONLY the JSON object, nothing else`

/**
 * Generates a MemeTree from a seed idea using LM Studio.
 *
 * Extracts the JSON block from the AI response (handles cases where the model
 * wraps output in markdown fences despite instructions).
 */
export async function generateMemeTree(
  client: LMStudioClient,
  seedIdea: string,
): Promise<MemeTree> {
  const raw = await client.complete([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Seed idea: "${seedIdea}"` },
  ])

  const json = extractJSON(raw)
  try {
    const parsed = parseAIResponse(json)
    return layoutTree(buildTree(parsed))
  } catch (err) {
    // Log the raw model output to aid prompt iteration
    console.warn('[SeedHeart] AI response parse failed.\nRaw output:\n', raw)
    throw err
  }
}

/**
 * Strips markdown code fences and <think>...</think> chain-of-thought blocks
 * (produced by Qwen3, DeepSeek-R1, and similar reasoning models) before
 * extracting the JSON object.
 */
export function extractJSON(text: string): string {
  // Remove <think>...</think> reasoning blocks (Qwen3 / DeepSeek-R1 style)
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  // Handle markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()

  // Fallback: extract from first { to last }
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start !== -1 && end > start) return stripped.slice(start, end + 1)

  return stripped
}
