/**
 * Core meme-tree data types shared across the entire application.
 * Nothing in this file imports from other src/ modules.
 */

export interface MemeNode {
  id: string
  label: string
  content: string
  /** depth from root (root = 0) */
  depth: number
  parentId: string | null
  children: string[]
  /** layout coordinates — populated by TreeLayout */
  x: number
  y: number
  z: number
}

export interface MemeEdge {
  id: string
  sourceId: string
  targetId: string
}

export interface MemeTree {
  nodes: Record<string, MemeNode>
  edges: MemeEdge[]
  rootId: string
}

export type NodeId = string
