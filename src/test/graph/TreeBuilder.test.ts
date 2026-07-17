import { describe, it, expect } from 'vitest'
import { buildTree } from '@/graph/TreeBuilder'
import { FIXTURE_RAW } from '@/graph/fixtures'

describe('buildTree', () => {
  it('produces a MemeTree with the root id matching the raw root', () => {
    const tree = buildTree(FIXTURE_RAW)
    expect(tree.rootId).toBe('consciousness')
  })

  it('flattens all nodes into the nodes record', () => {
    const tree = buildTree(FIXTURE_RAW)
    // root + 3 depth-1 + 6 depth-2 = 10 nodes
    expect(Object.keys(tree.nodes)).toHaveLength(10)
  })

  it('creates edges for every parent-child relationship', () => {
    const tree = buildTree(FIXTURE_RAW)
    // 9 edges for a 10-node tree
    expect(tree.edges).toHaveLength(9)
  })

  it('correctly assigns parentId', () => {
    const tree = buildTree(FIXTURE_RAW)
    expect(tree.nodes['consciousness'].parentId).toBeNull()
    expect(tree.nodes['qualia'].parentId).toBe('consciousness')
    expect(tree.nodes['qualia-hard'].parentId).toBe('qualia')
  })

  it('assigns correct depth to each level', () => {
    const tree = buildTree(FIXTURE_RAW)
    expect(tree.nodes['consciousness'].depth).toBe(0)
    expect(tree.nodes['qualia'].depth).toBe(1)
    expect(tree.nodes['qualia-hard'].depth).toBe(2)
  })

  it('initialises x/y/z to 0', () => {
    const tree = buildTree(FIXTURE_RAW)
    for (const node of Object.values(tree.nodes)) {
      expect(node.x).toBe(0)
      expect(node.y).toBe(0)
      expect(node.z).toBe(0)
    }
  })

  it('respects MAX_TREE_BREADTH — trims excess children', () => {
    const wideRaw = {
      id: 'wide',
      label: 'Wide',
      content: 'root',
      children: Array.from({ length: 20 }, (_, i) => ({
        id: `child-${i}`,
        label: `Child ${i}`,
        content: 'x',
        children: [],
      })),
    }
    const tree = buildTree(wideRaw)
    expect(tree.nodes['wide'].children.length).toBeLessThanOrEqual(5)
  })

  it('respects MAX_TREE_DEPTH — stops at depth limit', () => {
    function deepRaw(depth: number): {
      id: string
      label: string
      content: string
      children: ReturnType<typeof deepRaw>[]
    } {
      return {
        id: `node-${depth}`,
        label: `Node ${depth}`,
        content: 'x',
        children: depth < 10 ? [deepRaw(depth + 1)] : [],
      }
    }
    const tree = buildTree(deepRaw(0))
    const maxDepth = Math.max(...Object.values(tree.nodes).map((n) => n.depth))
    expect(maxDepth).toBeLessThanOrEqual(6)
  })
})
