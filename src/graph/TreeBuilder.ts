import type { MemeTree, MemeNode, MemeEdge } from './types'
import { MAX_TREE_DEPTH, MAX_TREE_BREADTH } from '@/constants'

/**
 * Raw shape returned by the LM Studio parser before it becomes a MemeTree.
 */
export interface RawMemeNode {
  id: string
  label: string
  content: string
  children?: RawMemeNode[]
}

/**
 * Converts a validated raw node tree into a flat MemeTree, enforcing
 * MAX_TREE_DEPTH and MAX_TREE_BREADTH guards.
 */
export function buildTree(raw: RawMemeNode): MemeTree {
  const nodes: Record<string, MemeNode> = {}
  const edges: MemeEdge[] = []

  function visit(rawNode: RawMemeNode, parentId: string | null, depth: number): void {
    if (depth > MAX_TREE_DEPTH) return

    const childRaws = (rawNode.children ?? []).slice(0, MAX_TREE_BREADTH)
    const childIds = childRaws.map((c) => c.id)

    const node: MemeNode = {
      id: rawNode.id,
      label: rawNode.label,
      content: rawNode.content,
      depth,
      parentId,
      children: childIds,
      x: 0,
      y: 0,
      z: 0,
    }
    nodes[node.id] = node

    if (parentId !== null) {
      edges.push({ id: `${parentId}->${rawNode.id}`, sourceId: parentId, targetId: rawNode.id })
    }

    for (const child of childRaws) {
      visit(child, rawNode.id, depth + 1)
    }
  }

  visit(raw, null, 0)

  return { nodes, edges, rootId: raw.id }
}
