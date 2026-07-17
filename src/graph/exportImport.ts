import type { MemeTree } from './types'
import type { RawMemeNode } from './TreeBuilder'
import { buildTree } from './TreeBuilder'
import { layoutTree } from './TreeLayout'
import { parseAIResponse } from './TreeParser'

// ─── Tree → Raw (for export) ──────────────────────────────────────────────────

/**
 * Converts a flat MemeTree back to the recursive RawMemeNode format.
 * This is the canonical serialisation format for export/import.
 */
export function treeToRaw(tree: MemeTree): RawMemeNode {
  function convertNode(id: string): RawMemeNode {
    const node = tree.nodes[id]
    const raw: RawMemeNode = {
      id: node.id,
      label: node.label,
      content: node.content,
    }
    if (node.children.length > 0) {
      raw.children = node.children.map(convertNode)
    }
    return raw
  }
  return convertNode(tree.rootId)
}

// ─── JSON Export ──────────────────────────────────────────────────────────────

/**
 * Serialises a MemeTree to a pretty-printed JSON string (RawMemeNode format).
 * The resulting string can be re-imported with importFromJSON.
 */
export function exportToJSON(tree: MemeTree): string {
  return JSON.stringify(treeToRaw(tree), null, 2)
}

// ─── JSON Import ──────────────────────────────────────────────────────────────

/**
 * Parses a JSON string (RawMemeNode format) and returns a laid-out MemeTree.
 * Throws TreeParseError if the JSON is invalid or structurally incorrect.
 */
export function importFromJSON(json: string): MemeTree {
  const raw = parseAIResponse(json)
  return layoutTree(buildTree(raw))
}

// ─── File Utilities ───────────────────────────────────────────────────────────

/**
 * Triggers a browser file download with the given text content.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * Reads a File object and returns its text content.
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to read file as text'))
      }
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsText(file)
  })
}
