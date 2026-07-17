import type { MemeTree, MemeNode } from './types'

/**
 * Assigns x/y/z world-space coordinates to every node in the tree.
 * Uses a simple radial layout:
 *   - y is determined by depth (root at top, leaves at bottom)
 *   - x/z are distributed evenly on a circle whose radius scales with depth
 */
export function layoutTree(tree: MemeTree): MemeTree {
  const VERTICAL_SPACING = 3.5
  const BASE_RADIUS = 5
  const RADIUS_SCALE = 1.6

  const updatedNodes: Record<string, MemeNode> = {}

  function visit(nodeId: string, angle: number, spread: number, depth: number): void {
    const node = tree.nodes[nodeId]
    if (!node) return

    const radius = depth === 0 ? 0 : BASE_RADIUS * Math.pow(RADIUS_SCALE, depth - 1)
    const x = depth === 0 ? 0 : radius * Math.cos(angle)
    const y = depth === 0 ? 0 : -depth * VERTICAL_SPACING
    const z = depth === 0 ? 0 : radius * Math.sin(angle)

    updatedNodes[nodeId] = { ...node, x, y, z }

    const childCount = node.children.length
    if (childCount === 0) return

    const childSpread = spread / Math.max(childCount, 1)
    node.children.forEach((childId, i) => {
      const childAngle = angle - spread / 2 + childSpread * i + childSpread / 2
      visit(childId, childAngle, childSpread, depth + 1)
    })
  }

  visit(tree.rootId, 0, Math.PI * 2, 0)

  return { ...tree, nodes: updatedNodes }
}
